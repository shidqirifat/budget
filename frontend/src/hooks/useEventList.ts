import { useState, useEffect } from "react";
import {
  eventService,
  BudgetEvent,
  EventPayload,
} from "@/services/event.service";

const TODAY = new Date().toISOString().slice(0, 10);

export function isEventActive(ev: BudgetEvent): boolean {
  const start = ev.startDate.slice(0, 10);
  const end = ev.endDate ? ev.endDate.slice(0, 10) : "";
  return start <= TODAY && (!end || TODAY <= end);
}

export function useEventList(isMobile: boolean) {
  const [events, setEvents] = useState<BudgetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [saving, setSaving] = useState(false);

  const visibleEvents = events.filter((ev) =>
    activeTab === "active" ? isEventActive(ev) : !isEventActive(ev),
  );

  const selected = events.find((e) => e.id === selectedId) ?? null;

  useEffect(() => {
    setLoading(true);
    eventService
      .getAll()
      .then((res) => {
        const data = res.data.data;
        setEvents(data);
        if (data.length > 0 && !isMobile) {
          const active = data.find((e) => isEventActive(e));
          setSelectedId(active?.id ?? data[0].id);
          setActiveTab(active ? "active" : "inactive");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectEvent = (id: string) => setSelectedId(id);

  const handleAddEvent = async () => {
    if (!newName.trim() || !newStart) return;
    setSaving(true);
    try {
      const payload: EventPayload = {
        name: newName.trim(),
        description: newNote.trim() || undefined,
        startDate: `${newStart}T00:00:00.000Z`,
        endDate: newEnd ? `${newEnd}T23:59:59.999Z` : undefined,
      };
      const res = await eventService.create(payload);
      const ev = res.data.data;
      setEvents((prev) => [ev, ...prev]);
      setSelectedId(ev.id);
      setActiveTab(isEventActive(ev) ? "active" : "inactive");
      setShowAdd(false);
      setNewName("");
      setNewNote("");
      setNewStart("");
      setNewEnd("");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await eventService.remove(id);
    const remaining = events.filter((e) => e.id !== id);
    setEvents(remaining);
    setSelectedId(remaining.length ? remaining[0].id : null);
  };

  const handleCancelAdd = () => {
    setShowAdd(false);
    setNewName("");
    setNewNote("");
    setNewStart("");
    setNewEnd("");
  };

  return {
    events,
    loading,
    activeTab,
    setActiveTab,
    selectedId,
    setSelectedId,
    selected,
    visibleEvents,
    showAdd,
    setShowAdd,
    newName,
    setNewName,
    newNote,
    setNewNote,
    newStart,
    setNewStart,
    newEnd,
    setNewEnd,
    saving,
    handleSelectEvent,
    handleAddEvent,
    handleDeleteEvent,
    handleCancelAdd,
  };
}
