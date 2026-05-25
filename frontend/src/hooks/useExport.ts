import { useState, useCallback, useEffect } from "react";
import { transactionService } from "@/services/transaction.service";
import { eventService, BudgetEvent } from "@/services/event.service";

export function useExport() {
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [exporting, setExporting] = useState(false);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exportEventId, setExportEventId] = useState("");
  const [events, setEvents] = useState<BudgetEvent[]>([]);

  useEffect(() => {
    eventService
      .getAll()
      .then((res) => setEvents(res.data.data))
      .catch(() => {});
  }, []);

  const handleExport = useCallback(
    async (fmt: "csv" | "json") => {
      setExporting(true);
      try {
        const { url, token } = transactionService.exportUrl(fmt, {
          from: exportFrom || undefined,
          to: exportTo || undefined,
          eventId: exportEventId || undefined,
        });
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = `budget_export.${fmt}`;
        a.click();
        URL.revokeObjectURL(objectUrl);
      } catch {
        // silent
      } finally {
        setExporting(false);
      }
    },
    [exportFrom, exportTo, exportEventId],
  );

  const resetFilters = useCallback(() => {
    setExportFrom("");
    setExportTo("");
    setExportEventId("");
  }, []);

  return {
    exportFormat,
    setExportFormat,
    exporting,
    exportFrom,
    setExportFrom,
    exportTo,
    setExportTo,
    exportEventId,
    setExportEventId,
    events,
    handleExport,
    resetFilters,
  };
}
