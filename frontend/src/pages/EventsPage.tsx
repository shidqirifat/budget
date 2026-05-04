import { useState, useEffect, useCallback } from "react";
import dayjs from "@/utils/dayjs";
import { formatCurrency } from "@/utils/format";
import { eventService, BudgetEvent } from "@/services/event.service";
import {
  transactionService,
  Transaction,
} from "@/services/transaction.service";

const TODAY = new Date().toISOString().slice(0, 10);

// Simple hook to detect mobile breakpoint
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function EventsPage() {
  const isMobile = useIsMobile();
  const [events, setEvents] = useState<BudgetEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [saving, setSaving] = useState(false);

  // Transactions linked to selected event
  const [linkedTxs, setLinkedTxs] = useState<Transaction[]>([]);
  // Transactions in date range but not linked
  const [recommendedTxs, setRecommendedTxs] = useState<Transaction[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(false);

  // Monthly outflow for contribution %
  const [monthOutflow, setMonthOutflow] = useState(0);

  const isActive = (ev: BudgetEvent) => {
    const start = ev.startDate.slice(0, 10);
    const end = ev.endDate ? ev.endDate.slice(0, 10) : "";
    return start <= TODAY && (!end || TODAY <= end);
  };

  const visibleEvents = events.filter((ev) =>
    activeTab === "active" ? isActive(ev) : !isActive(ev),
  );

  const selected = events.find((e) => e.id === selectedId) ?? null;
  const selectedIsActive = selected ? isActive(selected) : false;

  // Fetch all events on mount
  useEffect(() => {
    setLoadingEvents(true);
    eventService
      .getAll()
      .then((res) => {
        const data = res.data.data;
        setEvents(data);
        if (data.length > 0 && !isMobile) {
          const active = data.find((e) => isActive(e));
          setSelectedId(active?.id ?? data[0].id);
          setActiveTab(active ? "active" : "inactive");
        }
      })
      .finally(() => setLoadingEvents(false));
  }, []);

  // Fetch transactions when selected event changes
  useEffect(() => {
    if (!selected) {
      setLinkedTxs([]);
      setRecommendedTxs([]);
      setMonthOutflow(0);
      return;
    }
    setLoadingTxs(true);
    const start = selected.startDate.slice(0, 10);
    const end = selected.endDate ? selected.endDate.slice(0, 10) : TODAY;

    Promise.all([
      transactionService.getAll({ eventId: selected.id }),
      transactionService.getAll({
        from: `${start}T00:00:00.000Z`,
        to: `${end}T23:59:59.999Z`,
      }),
      transactionService.getSummary({
        from: `${start.slice(0, 7)}-01T00:00:00.000Z`,
        to: `${start.slice(0, 7)}-${new Date(new Date(start).getFullYear(), new Date(start).getMonth() + 1, 0).getDate()}T23:59:59.999Z`,
      }),
    ])
      .then(([linkedRes, rangeRes, summaryRes]) => {
        const linked = linkedRes.data.data;
        setLinkedTxs(linked);
        const linkedIds = new Set(linked.map((t) => t.id));
        setRecommendedTxs(
          rangeRes.data.data.filter((t) => !linkedIds.has(t.id)),
        );
        setMonthOutflow(summaryRes.data.data.totalExpense);
      })
      .finally(() => setLoadingTxs(false));
  }, [selectedId]);

  const eventTotal = linkedTxs.reduce((s, t) => {
    return s + (t.type.name === "income" ? t.amount : -t.amount);
  }, 0);

  const eventOutflow = linkedTxs
    .filter((t) => t.type.name === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const contributionPct =
    monthOutflow > 0 ? Math.round((eventOutflow / monthOutflow) * 100) : 0;

  const linkTx = useCallback(
    async (txId: string) => {
      if (!selectedId) return;
      await transactionService.patchEvent(txId, selectedId);
      setLinkedTxs((prev) => {
        const tx = recommendedTxs.find((t) => t.id === txId);
        return tx ? [...prev, tx] : prev;
      });
      setRecommendedTxs((prev) => prev.filter((t) => t.id !== txId));
    },
    [selectedId, recommendedTxs],
  );

  const unlinkTx = useCallback(
    async (txId: string) => {
      await transactionService.patchEvent(txId, null);
      setRecommendedTxs((prev) => {
        const tx = linkedTxs.find((t) => t.id === txId);
        return tx ? [...prev, tx] : prev;
      });
      setLinkedTxs((prev) => prev.filter((t) => t.id !== txId));
    },
    [linkedTxs],
  );

  const addEvent = async () => {
    if (!newName.trim() || !newStart) return;
    setSaving(true);
    try {
      const res = await eventService.create({
        name: newName.trim(),
        description: newNote.trim() || undefined,
        startDate: `${newStart}T00:00:00.000Z`,
        endDate: newEnd ? `${newEnd}T23:59:59.999Z` : undefined,
      });
      const ev = res.data.data;
      setEvents((prev) => [ev, ...prev]);
      setSelectedId(ev.id);
      setActiveTab(isActive(ev) ? "active" : "inactive");
      setShowAdd(false);
      setNewName("");
      setNewNote("");
      setNewStart("");
      setNewEnd("");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async () => {
    if (!selectedId) return;
    if (!window.confirm(`Delete "${selected?.name}"? This cannot be undone.`)) return;
    await eventService.remove(selectedId);
    const remaining = events.filter((e) => e.id !== selectedId);
    setEvents(remaining);
    setSelectedId(remaining.length ? remaining[0].id : null);
  };

  const formatDateLabel = (d: string) => {
    if (!d) return "—";
    return dayjs(d.slice(0, 10)).format("D MMMM YYYY");
  };

  const amountColor = (_amount: number, typeName: string) =>
    typeName === "income" ? "#2A9D5C" : "#E05C5C";

  const sectionHead = (label: string) => (
    <div
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: "#bbb",
        letterSpacing: "0.08em",
        marginBottom: 10,
      }}
    >
      {label}
    </div>
  );

  const TxRow = ({
    tx,
    i,
    action,
    actionLabel,
    actionStyle,
  }: {
    tx: Transaction;
    i: number;
    action: (id: string) => void;
    actionLabel: string;
    actionStyle: React.CSSProperties;
  }) => (
    <div
      className="flex-col xs:flex-row xs:items-center"
      style={{
        display: "flex",
        gap: 14,
        padding: "13px 16px",
        background: i % 2 === 0 ? "white" : "#FAFAF8",
        borderBottom: "1px solid #F2F2EE",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#111",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {tx.note || "—"}
        </div>
        <div style={{ fontSize: 11, color: "#bbb", marginTop: 1 }}>
          {dayjs(tx.date.slice(0, 10)).format("D MMM YYYY")} ·{" "}
          {tx.category.name}
          {tx.subCategory ? ` / ${tx.subCategory.name}` : ""}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: amountColor(tx.amount, tx.type.name),
            flexShrink: 0,
          }}
        >
          {tx.type.name === "income" ? "+" : "-"}
          {formatCurrency(tx.amount)}
        </div>
        <button
          onClick={() => action(tx.id)}
          style={{
            padding: "5px 12px",
            borderRadius: 6,
            border: "none",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
            ...actionStyle,
          }}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );

  if (loadingEvents) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F5F2",
          color: "#aaa",
          fontSize: 14,
        }}
      >
        Loading events…
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        height: isMobile ? "auto" : "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#F5F5F2",
        overflow: isMobile ? "auto" : "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: isMobile ? "20px 16px 12px" : "28px 32px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isMobile && selectedId && (
            <button
              onClick={() => setSelectedId(null)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #E5E5E0",
                background: "white",
                color: "#555",
                fontSize: 13,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ← Back
            </button>
          )}
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#111",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Events
            </h1>
            <p style={{ fontSize: 13, color: "#999", margin: "3px 0 0" }}>
              Track why a month spikes
            </p>
          </div>
        </div>
        {(!isMobile || !selectedId) && (
          <button
            onClick={() => setShowAdd(true)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "#D1FF19",
              color: "#111",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Event
          </button>
        )}
      </div>

      {/* Two panels */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flex: 1,
          padding: isMobile ? "0 16px 24px" : "0 32px 32px",
          gap: 20,
          overflow: isMobile ? "auto" : "hidden",
        }}
      >
        {/* Left list — hidden on mobile when detail is open */}
        <div
          style={{
            width: isMobile ? "100%" : 264,
            flexShrink: 0,
            background: "white",
            borderRadius: 12,
            border: "1px solid #EEEEE8",
            overflow: "hidden",
            display: isMobile && selectedId ? "none" : "flex",
            flexDirection: "column",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #F2F2EE",
              flexShrink: 0,
            }}
          >
            {(["active", "inactive"] as const).map((tab) => {
              const label = tab === "active" ? "Active" : "Inactive";
              const count = events.filter((e) =>
                tab === "active" ? isActive(e) : !isActive(e),
              ).length;
              return (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    textAlign: "center",
                    cursor: "pointer",
                    borderBottom: `2.5px solid ${activeTab === tab ? "#D1FF19" : "transparent"}`,
                    background: activeTab === tab ? "#FAFDE8" : "white",
                    transition: "all 0.12s",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: activeTab === tab ? 700 : 400,
                      color: activeTab === tab ? "#111" : "#aaa",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 11,
                      padding: "1px 7px",
                      borderRadius: 10,
                      background: activeTab === tab ? "#D1FF19" : "#F0F0EA",
                      color: activeTab === tab ? "#111" : "#aaa",
                      fontWeight: 600,
                    }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {visibleEvents.length === 0 && !showAdd && (
              <div
                style={{
                  padding: "28px 16px",
                  textAlign: "center",
                  color: "#ccc",
                  fontSize: 12,
                  fontStyle: "italic",
                }}
              >
                No {activeTab} events
              </div>
            )}
            {visibleEvents.map((ev) => {
              const active = selectedId === ev.id;
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedId(ev.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    cursor: "pointer",
                    borderBottom: "1px solid #F8F8F4",
                    background: active ? "#FAFDE8" : "white",
                    borderLeft: `3px solid ${active ? "#D1FF19" : "transparent"}`,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!active)
                      (e.currentTarget as HTMLElement).style.background =
                        "#FAFAF7";
                  }}
                  onMouseLeave={(e) => {
                    if (!active)
                      (e.currentTarget as HTMLElement).style.background =
                        "white";
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: active ? 700 : 500,
                        color: "#111",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ev.name}
                    </div>
                    <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>
                      {formatDateLabel(ev.startDate)} –{" "}
                      {ev.endDate ? formatDateLabel(ev.endDate) : "ongoing"}
                    </div>
                  </div>
                </div>
              );
            })}

            {showAdd && (
              <div
                style={{ padding: "14px 16px", borderTop: "1px solid #F0F0EA" }}
              >
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Event name…"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #E5E5E0",
                    fontSize: 13,
                    color: "#333",
                    outline: "none",
                    marginBottom: 8,
                    boxSizing: "border-box",
                  }}
                />
                <div
                  className="flex-col"
                  style={{ display: "flex", gap: 8, marginBottom: 8 }}
                >
                  <input
                    type="date"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "7px 10px",
                      borderRadius: 8,
                      border: "1px solid #E5E5E0",
                      fontSize: 12,
                      outline: "none",
                    }}
                  />
                  <input
                    type="date"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "7px 10px",
                      borderRadius: 8,
                      border: "1px solid #E5E5E0",
                      fontSize: 12,
                      outline: "none",
                    }}
                  />
                </div>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Description…"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #E5E5E0",
                    fontSize: 12,
                    color: "#333",
                    outline: "none",
                    resize: "none",
                    marginBottom: 8,
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={addEvent}
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: 8,
                      border: "none",
                      background: "#D1FF19",
                      color: "#111",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? "Saving…" : "Add"}
                  </button>
                  <button
                    onClick={() => setShowAdd(false)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #E5E5E0",
                      background: "white",
                      color: "#888",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right detail — hidden on mobile when no event selected */}
        <div
          style={{
            flex: 1,
            background: "white",
            borderRadius: 12,
            border: "1px solid #EEEEE8",
            display: isMobile && !selectedId ? "none" : "flex",
            flexDirection: "column",
            overflow: isMobile ? "visible" : "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {selected ? (
            <>
              <div
                className="flex-col xs:flex-row xs:items-center"
                style={{
                  padding: isMobile ? "16px 20px" : "22px 28px",
                  borderBottom: "1px solid #F2F2EE",
                  display: "flex",
                  gap: 16,
                  flexShrink: 0,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#111",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {selected.name}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>
                    {formatDateLabel(selected.startDate)} –{" "}
                    {selected.endDate
                      ? formatDateLabel(selected.endDate)
                      : "ongoing"}{" "}
                    · {linkedTxs.length} linked
                  </div>
                </div>
                <div className="sm:text-right">
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#bbb",
                      letterSpacing: "0.07em",
                      marginBottom: 4,
                    }}
                  >
                    TOTAL IMPACT
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: eventTotal >= 0 ? "#2A9D5C" : "#E05C5C",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {eventTotal >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(eventTotal))}
                  </div>
                </div>
                <button
                  onClick={deleteEvent}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid #FDEAEA",
                    background: "#FDF8F8",
                    color: "#E05C5C",
                    fontSize: 12,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  Delete
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: isMobile ? "16px 20px" : "24px 28px",
                }}
              >
                {selected.description && (
                  <div style={{ marginBottom: 22 }}>
                    {sectionHead("DESCRIPTION")}
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "#FAFDF0",
                        borderRadius: 8,
                        border: "1px solid #E8F5A0",
                        fontSize: 13,
                        color: "#555",
                        lineHeight: 1.6,
                      }}
                    >
                      {selected.description}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 22 }}>
                  {sectionHead("IMPACT ANALYSIS")}
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 impact-analysis">
                    {[
                      {
                        label: "MONTH OUTFLOW",
                        value: formatCurrency(monthOutflow),
                        color: "#888",
                      },
                      {
                        label: "EVENT SPEND",
                        value: formatCurrency(eventOutflow),
                        color: "#E05C5C",
                      },
                      {
                        label: "CONTRIBUTION",
                        value: `${contributionPct}%`,
                        color: "#E8A040",
                        sub: `of ${dayjs(selected.startDate.slice(0, 10)).format("MMMM")} outflow`,
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          background: "#F9F9F7",
                          borderRadius: 10,
                          padding: "14px 16px",
                          border: "1px solid #F0F0EA",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            color: "#bbb",
                            letterSpacing: "0.08em",
                            marginBottom: 6,
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: item.color,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {item.value}
                        </div>
                        {item.sub && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "#bbb",
                              marginTop: 3,
                            }}
                          >
                            {item.sub}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {monthOutflow > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 3,
                          background: "#F2F2EE",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(contributionPct, 100)}%`,
                            background: "#E8A040",
                            borderRadius: 3,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 4,
                        }}
                      >
                        <span style={{ fontSize: 10, color: "#bbb" }}>
                          Event spend
                        </span>
                        <span style={{ fontSize: 10, color: "#bbb" }}>
                          Monthly total
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 22 }}>
                  {sectionHead(`LINKED TRANSACTIONS (${linkedTxs.length})`)}
                  <div
                    style={{
                      border: "1px solid #EEEEE8",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    {loadingTxs ? (
                      <div
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#ccc",
                          fontSize: 12,
                        }}
                      >
                        Loading…
                      </div>
                    ) : linkedTxs.length === 0 ? (
                      <div
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#ccc",
                          fontSize: 12,
                          fontStyle: "italic",
                        }}
                      >
                        No transactions linked yet
                      </div>
                    ) : (
                      linkedTxs.map((tx, i) => (
                        <TxRow
                          key={tx.id}
                          tx={tx}
                          i={i}
                          action={unlinkTx}
                          actionLabel="Unlink"
                          actionStyle={{
                            background: "#FDF8F8",
                            color: "#E05C5C",
                            border: "1px solid #F0E0E0",
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>

                {!loadingTxs && recommendedTxs.length > 0 && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 10,
                      }}
                    >
                      {sectionHead("RECOMMENDED TO LINK")}
                      <div
                        style={{
                          padding: "2px 8px",
                          borderRadius: 10,
                          background: "#FAFDE8",
                          border: "1px solid #E8F5A0",
                          fontSize: 10,
                          color: "#7a9a00",
                          fontWeight: 600,
                          marginBottom: 10,
                        }}
                      >
                        {recommendedTxs.length} match date range
                      </div>
                    </div>
                    <div
                      style={{
                        border: "1.5px dashed #D1FF19",
                        borderRadius: 10,
                        overflow: "hidden",
                        background: "#FAFDF5",
                      }}
                    >
                      {recommendedTxs.map((tx, i) => (
                        <TxRow
                          key={tx.id}
                          tx={tx}
                          i={i}
                          action={linkTx}
                          actionLabel="Link"
                          actionStyle={{ background: "#D1FF19", color: "#111" }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {!loadingTxs &&
                  recommendedTxs.length === 0 &&
                  linkedTxs.length > 0 && (
                    <div
                      style={{
                        padding: "14px",
                        background: "#F8F8F5",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#bbb",
                        textAlign: "center",
                        fontStyle: "italic",
                      }}
                    >
                      No more transactions in this date range to link
                    </div>
                  )}
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ccc",
                fontSize: 14,
              }}
            >
              {events.length === 0
                ? "Create your first event to get started"
                : "Select an event to view details"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
