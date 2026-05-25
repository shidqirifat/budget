import { useState, useRef, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  transactionService,
  ImportRowPayload,
  ImportRowResult,
} from "@/services/transaction.service";
import { categoryService } from "@/services/category.service";
import { eventService, BudgetEvent } from "@/services/event.service";
import { formatCurrency } from "@/utils/format";
import IconFileCheck from "@/assets/icons/IconFileCheck";
import IconDownload from "@/assets/icons/IconDownload";
import IconUpload from "@/assets/icons/IconUpload";
import IconAlertCircle from "@/assets/icons/IconAlertCircle";
import IconCheckCircle from "@/assets/icons/IconCheckCircle";

// ─── helpers ────────────────────────────────────────────────────────────────

function xlsxDateToISO(val: unknown): string {
  if (val === null || val === undefined || val === "") return "";
  // Already a formatted string
  if (typeof val === "string") {
    const s = val.trim();
    // Accept YYYY-MM-DD or DD/MM/YYYY or MM/DD/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return s;
  }
  // Excel serial number
  if (typeof val === "number") {
    const d = XLSX.SSF.parse_date_code(val);
    if (d) {
      const mm = String(d.m).padStart(2, "0");
      const dd = String(d.d).padStart(2, "0");
      return `${d.y}-${mm}-${dd}`;
    }
  }
  return String(val);
}

function parseWorkbook(buffer: ArrayBuffer): ParsedRow[] {
  const wb = XLSX.read(buffer, { type: "array", cellDates: false });
  // Prefer sheet named "Import Data", fall back to first sheet
  const sheetName = wb.SheetNames.includes("Import Data")
    ? "Import Data"
    : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, {
    defval: "",
  });
  return rows
    .map((row, i) => ({
      index: i,
      date: xlsxDateToISO(row["date"]),
      amount: String(row["amount"] ?? "").trim(),
      type: String(row["type"] ?? "")
        .trim()
        .toLowerCase(),
      category: String(row["category"] ?? "").trim(),
      sub_category: String(row["sub_category"] ?? "").trim(),
      note: String(row["note"] ?? "").trim(),
    }))
    .filter((r) => r.date || r.amount || r.category);
}

function sectionHead(label: string, note?: string) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#aaa",
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {label}
      {note && (
        <span
          style={{
            fontWeight: 400,
            color: "#ccc",
            letterSpacing: 0,
            textTransform: "none",
            fontSize: 11,
          }}
        >
          {note}
        </span>
      )}
    </div>
  );
}

const css = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .ie-tab-btn { transition: all 0.12s; }
  .ie-tab-btn:hover { opacity: 0.85; }
  .ie-export-card { transition: border-color 0.12s; }
  .ie-export-card:hover { border-color: #D1FF19 !important; }
  .ie-dl-btn:hover { opacity: 0.85; }

  .ie-page { padding: 20px 32px 32px; }
  .ie-header { padding: 28px 32px 0; }
  .ie-tabbar { padding: 18px 32px 0; }
  .ie-body { display: flex; gap: 20px; flex-direction: row; }
  .ie-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
  .ie-guide { width: 256px; flex-shrink: 0; position: sticky; top: 0; align-self: flex-start; max-height: calc(100vh - 160px); display: flex; flex-direction: column; }
  .ie-col-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .ie-export-body { flex: 1; display: flex; gap: 20px; align-items: flex-start; min-width: 0; }
  .ie-export-left { flex: 1; }
  .ie-export-right { width: 256px; flex-shrink: 0; }
  .ie-review-table { overflow-x: auto; }
  .ie-template-card { display: flex; align-items: center; gap: 14px; flex-wrap: nowrap; }
  .ie-template-card .ie-dl-btn { flex-shrink: 0; }
  @media (max-width: 480px) {
    .ie-template-card { flex-wrap: wrap; }
    .ie-template-card .ie-dl-btn { width: 100%; justify-content: center; }
  }

  @media (max-width: 768px) {
    .ie-page { padding: 12px 16px 24px; }
    .ie-header { padding: 20px 16px 0; }
    .ie-tabbar { padding: 14px 16px 0; }
    .ie-body { flex-direction: column; }
    .ie-guide { width: 100%; position: static; max-height: none; }
    .ie-col-grid { grid-template-columns: repeat(2, 1fr); }
    .ie-export-body { flex-direction: column; }
    .ie-export-right { width: 100%; }
  }

  @media (max-width: 480px) {
    .ie-col-grid { grid-template-columns: 1fr; }
  }
`;

// ─── parsed row preview ──────────────────────────────────────────────────────

interface ParsedRow {
  index: number;
  date: string;
  amount: string;
  type: string;
  category: string;
  sub_category: string;
  note: string;
}

interface ReviewRow {
  index: number;
  date: string;
  amount: string;
  type: string;
  category: string;
  sub_category: string;
  note: string;
  status: "pending" | "ok" | "error";
  serverErrors?: string[];
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function ImportExportPage() {
  const [tab, setTab] = useState<"import" | "export">("import");

  // import state
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [reviewRows, setReviewRows] = useState<ReviewRow[]>([]);
  const [parseStage, setParseStage] = useState<
    "idle" | "preview" | "submitting" | "done"
  >("idle");
  const [importResult, setImportResult] = useState<{
    imported: number;
    errors: number;
  } | null>(null);
  const [submitError, setSubmitError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // categories from API
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);

  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => {
        const cats = res.data.data;
        setExpenseCategories(
          cats.filter((c) => c.type.name === "expense").map((c) => c.name),
        );
        setIncomeCategories(
          cats.filter((c) => c.type.name === "income").map((c) => c.name),
        );
      })
      .catch(() => {});
  }, []);

  // export state
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

  // ─── template download ────────────────────────────────────────────────────

  const downloadTemplate = useCallback(() => {
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Import Data ──────────────────────────────────────────────
    const headers = [
      "date",
      "amount",
      "type",
      "category",
      "sub_category",
      "note",
    ];
    const examples = [
      [
        "2026-05-01",
        5200000,
        "income",
        "Salary",
        "Base Salary",
        "Gaji Mei 2026",
      ],
      [
        "2026-05-03",
        180000,
        "expense",
        "Food & Drink",
        "Groceries",
        "Alfamart",
      ],
      ["2026-05-05", 350000, "expense", "Bills", "Electricity", "PLN Mei"],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet([headers, ...examples]);

    // Column widths (chars)
    ws1["!cols"] = [
      { wch: 14 }, // date
      { wch: 14 }, // amount
      { wch: 12 }, // type
      { wch: 20 }, // category
      { wch: 20 }, // sub_category
      { wch: 30 }, // note
    ];

    // Freeze the header row
    ws1["!freeze"] = { xSplit: 0, ySplit: 1 };

    XLSX.utils.book_append_sheet(wb, ws1, "Import Data");

    // ── Sheet 2: Categories ───────────────────────────────────────────────
    const expenseRows = expenseCategories.map((c) => ["expense", c]);
    const incomeRows = incomeCategories.map((c) => ["income", c]);
    const catHeader = ["type", "category"];
    const ws2 = XLSX.utils.aoa_to_sheet([
      catHeader,
      ...expenseRows,
      ...incomeRows,
    ]);
    ws2["!cols"] = [{ wch: 12 }, { wch: 24 }];
    ws2["!freeze"] = { xSplit: 0, ySplit: 1 };

    XLSX.utils.book_append_sheet(wb, ws2, "Categories");

    XLSX.writeFile(wb, "template.xlsx");
  }, [expenseCategories, incomeCategories]);

  // ─── file handling ────────────────────────────────────────────────────────

  const loadFile = useCallback((f: File) => {
    setFile(f);
    setParseStage("idle");
    setReviewRows([]);
    setImportResult(null);
    setSubmitError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const rows = parseWorkbook(buffer);
      setParsedRows(rows);
      setReviewRows(rows.map((r) => ({ ...r, status: "pending" as const })));
      setParseStage("preview");
    };
    reader.readAsArrayBuffer(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) loadFile(f);
    },
    [loadFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) loadFile(f);
    },
    [loadFile],
  );

  // ─── submit import ────────────────────────────────────────────────────────

  const handleImport = useCallback(async () => {
    if (parsedRows.length === 0) return;
    setParseStage("submitting");
    setSubmitError("");
    try {
      const payload: ImportRowPayload[] = parsedRows.map(
        ({ date, amount, type, category, sub_category, note }) => ({
          date,
          amount,
          type,
          category,
          sub_category,
          note,
        }),
      );
      const res = await transactionService.importRows(payload);
      const { results, imported, errors } = res.data.data;
      setReviewRows((prev) =>
        prev.map((row, i) => {
          const r: ImportRowResult | undefined = results.find(
            (x) => x.index === i,
          );
          if (!r) return { ...row, status: "pending" };
          return { ...row, status: r.status, serverErrors: r.errors };
        }),
      );
      setImportResult({ imported, errors });
      setParseStage("done");
    } catch {
      setSubmitError(
        "Failed to import. Please check your connection and try again.",
      );
      setParseStage("preview");
    }
  }, [parsedRows]);

  // ─── export ───────────────────────────────────────────────────────────────

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

  // ─── derived ──────────────────────────────────────────────────────────────

  const okCount = reviewRows.filter(
    (r) => r.status === "ok" || r.status === "pending",
  ).length;
  const errCount = reviewRows.filter((r) => r.status === "error").length;

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <>
      <style>{css}</style>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#F5F5F2",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div className="ie-header" style={{ flexShrink: 0 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#111",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Import / Export
          </h1>
          <p style={{ fontSize: 13, color: "#999", margin: "3px 0 0" }}>
            Bulk-add transactions from a CSV file, or export your data.
          </p>
        </div>

        {/* Tab bar */}
        <div className="ie-tabbar" style={{ flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              gap: 0,
              background: "white",
              border: "1px solid #EEEEE8",
              borderRadius: 10,
              padding: 4,
              width: "fit-content",
            }}
          >
            {(["import", "export"] as const).map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  className="ie-tab-btn"
                  onClick={() => setTab(t)}
                  style={{
                    padding: "8px 26px",
                    borderRadius: 7,
                    border: "none",
                    cursor: "pointer",
                    background: active ? "#111" : "transparent",
                    color: active ? "#D1FF19" : "#888",
                    fontSize: 13,
                    fontWeight: active ? 700 : 400,
                    textTransform: "capitalize",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="ie-page ie-body" style={{ flex: 1, overflowY: "auto" }}>
          {/* ── IMPORT TAB ─────────────────────────────────────────── */}
          {tab === "import" && (
            <>
              {/* Left: main flow */}
              <div className="ie-main">
                {/* Step 1: template */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 24,
                    border: "1px solid #EEEEE8",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {sectionHead("STEP 1", "Prepare your file")}

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 20 }}
                  >
                    <div
                      className="ie-template-card"
                      style={{
                        flex: 1,
                        background: "#F5F5F2",
                        borderRadius: 10,
                        padding: "18px 20px",
                        border: "1px solid #EEEEE8",
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          background: "#111",
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <IconFileCheck />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#111",
                            marginBottom: 2,
                          }}
                        >
                          template.xlsx
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#aaa",
                            lineHeight: 1.5,
                          }}
                        >
                          2 sheets · Import Data + Categories reference
                        </div>
                      </div>
                      <button
                        className="ie-dl-btn"
                        onClick={downloadTemplate}
                        style={{
                          padding: "9px 18px",
                          borderRadius: 8,
                          border: "none",
                          background: "#D1FF19",
                          color: "#111",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          flexShrink: 0,
                        }}
                      >
                        <IconDownload size={13} />
                        Download Template
                      </button>
                    </div>
                  </div>

                  {/* Column reference */}
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#ccc",
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        marginBottom: 10,
                      }}
                    >
                      Column Reference
                    </div>
                    <div className="ie-col-grid">
                      {[
                        {
                          col: "date",
                          fmt: "YYYY-MM-DD",
                          req: true,
                          eg: "2026-05-01",
                        },
                        {
                          col: "amount",
                          fmt: "positive number (absolute value)",
                          req: true,
                          eg: "180000",
                        },
                        {
                          col: "type",
                          fmt: "income or expense",
                          req: true,
                          eg: "expense",
                        },
                        {
                          col: "category",
                          fmt: "must match a category name",
                          req: true,
                          eg: "Food & Drink",
                        },
                        {
                          col: "sub_category",
                          fmt: "must match a sub-category",
                          req: false,
                          eg: "Groceries",
                        },
                        {
                          col: "note",
                          fmt: "free text",
                          req: false,
                          eg: "Alfamart Citayam",
                        },
                      ].map((c) => (
                        <div
                          key={c.col}
                          style={{
                            background: "#FAFAF8",
                            borderRadius: 8,
                            padding: "11px 14px",
                            border: "1px solid #EEEEE8",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 5,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#111",
                              }}
                            >
                              {c.col}
                            </span>
                            {c.req ? (
                              <span
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  color: "#E05C5C",
                                  background: "#FDF0F0",
                                  padding: "2px 7px",
                                  borderRadius: 10,
                                  letterSpacing: "0.04em",
                                }}
                              >
                                REQUIRED
                              </span>
                            ) : (
                              <span style={{ fontSize: 9, color: "#bbb" }}>
                                optional
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#aaa",
                              marginBottom: 4,
                              lineHeight: 1.4,
                            }}
                          >
                            {c.fmt}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: "#888",
                              background: "#F0F0EC",
                              borderRadius: 5,
                              padding: "3px 8px",
                              display: "inline-block",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            e.g. {c.eg}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 2: upload */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 24,
                    border: "1px solid #EEEEE8",
                  }}
                >
                  {sectionHead("STEP 2", "Upload your file")}

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragOver ? "#D1FF19" : "#DDDDD8"}`,
                      borderRadius: 12,
                      padding: "36px 24px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      background: dragOver ? "#FAFDE8" : "#FAFAF8",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        background: dragOver ? "#111" : "#F0F0EA",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                        flexShrink: 0,
                      }}
                    >
                      <IconUpload color={dragOver ? "#D1FF19" : "#aaa"} />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: dragOver ? "#111" : "#444",
                          marginBottom: 4,
                        }}
                      >
                        {file ? file.name : "Drop your file here"}
                      </div>
                      <div style={{ fontSize: 12, color: "#bbb" }}>
                        {file
                          ? `${(file.size / 1024).toFixed(1)} KB · click to replace`
                          : "or click to browse · .xlsx or .csv"}
                      </div>
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInput}
                    style={{ display: "none" }}
                  />
                </div>

                {/* Step 3: review */}
                {parseStage !== "idle" && (
                  <div
                    style={{
                      background: "white",
                      borderRadius: 12,
                      padding: 24,
                      border: "1px solid #EEEEE8",
                    }}
                  >
                    {sectionHead("STEP 3", "Review & confirm")}

                    {/* Summary chips */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                      {[
                        {
                          label: "Total rows",
                          val: reviewRows.length,
                          color: "#111",
                          bg: "#F5F5F2",
                        },
                        {
                          label: "Ready to import",
                          val:
                            parseStage === "done"
                              ? (importResult?.imported ?? 0)
                              : reviewRows.filter((r) => r.status !== "error")
                                  .length,
                          color: "#2A9D5C",
                          bg: "#F0FDF5",
                        },
                        {
                          label: "Errors",
                          val:
                            parseStage === "done"
                              ? (importResult?.errors ?? 0)
                              : errCount,
                          color: errCount > 0 ? "#E05C5C" : "#2A9D5C",
                          bg: errCount > 0 ? "#FDF0F0" : "#F0FDF5",
                        },
                      ].map((s) => (
                        <div
                          key={s.label}
                          style={{
                            flex: 1,
                            background: s.bg,
                            borderRadius: 10,
                            padding: "14px 18px",
                            border: "1px solid #EEEEE8",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 22,
                              fontWeight: 700,
                              color: s.color,
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {s.val}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#aaa",
                              marginTop: 2,
                            }}
                          >
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Table */}
                    <div
                      className="ie-review-table"
                      style={{ borderRadius: 10, border: "1px solid #EEEEE8" }}
                    >
                      <div style={{ minWidth: 560 }}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "32px 100px 1fr 120px 100px 80px 80px",
                            background: "#F8F8F5",
                            padding: "9px 14px",
                            borderBottom: "1px solid #EEEEE8",
                          }}
                        >
                          {[
                            "",
                            "Date",
                            "Note",
                            "Category",
                            "Sub",
                            "Amount",
                            "Status",
                          ].map((h, i) => (
                            <div
                              key={i}
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: "#bbb",
                                letterSpacing: "0.07em",
                                textAlign: i >= 5 ? "right" : "left",
                              }}
                            >
                              {h}
                            </div>
                          ))}
                        </div>

                        {reviewRows.map((row, i) => {
                          const isErr = row.status === "error";
                          const isOk = row.status === "ok";
                          const amtNum = parseFloat(row.amount);
                          const isIncome =
                            row.type === "income" || row.type === "inflow";
                          return (
                            <div key={i}>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "32px 100px 1fr 120px 100px 80px 80px",
                                  padding: "11px 14px",
                                  alignItems: "center",
                                  background: isErr
                                    ? "#FFFAF9"
                                    : i % 2 === 0
                                      ? "white"
                                      : "#FAFAF7",
                                  borderBottom:
                                    i < reviewRows.length - 1
                                      ? "1px solid #F2F2EE"
                                      : "none",
                                  opacity:
                                    parseStage === "done" && isErr ? 0.45 : 1,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#ccc",
                                    fontVariantNumeric: "tabular-nums",
                                  }}
                                >
                                  {i + 1}
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color:
                                      isErr && !row.date ? "#E05C5C" : "#555",
                                    fontVariantNumeric: "tabular-nums",
                                  }}
                                >
                                  {row.date || (
                                    <span
                                      style={{
                                        color: "#E05C5C",
                                        fontStyle: "italic",
                                      }}
                                    >
                                      missing
                                    </span>
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#333",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    paddingRight: 12,
                                  }}
                                >
                                  {row.note || "—"}
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color:
                                      isErr && !row.category
                                        ? "#E05C5C"
                                        : "#444",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {row.category || (
                                    <span
                                      style={{
                                        fontStyle: "italic",
                                        color: "#E05C5C",
                                      }}
                                    >
                                      missing
                                    </span>
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#999",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {row.sub_category || "—"}
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    textAlign: "right",
                                    color: isNaN(amtNum)
                                      ? "#E05C5C"
                                      : isIncome
                                        ? "#2A9D5C"
                                        : "#E05C5C",
                                    fontVariantNumeric: "tabular-nums",
                                  }}
                                >
                                  {isNaN(amtNum) ? (
                                    <span
                                      style={{
                                        fontStyle: "italic",
                                        fontWeight: 400,
                                      }}
                                    >
                                      invalid
                                    </span>
                                  ) : (
                                    formatCurrency(isIncome ? amtNum : -amtNum)
                                  )}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  {isErr ? (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: "#E05C5C",
                                        background: "#FDF0F0",
                                        padding: "3px 9px",
                                        borderRadius: 10,
                                        letterSpacing: "0.04em",
                                      }}
                                    >
                                      ERROR
                                    </span>
                                  ) : isOk ? (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: "#2A9D5C",
                                        background: "#F0FDF5",
                                        padding: "3px 9px",
                                        borderRadius: 10,
                                        letterSpacing: "0.04em",
                                      }}
                                    >
                                      IMPORTED
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: "#888",
                                        background: "#F0F0EA",
                                        padding: "3px 9px",
                                        borderRadius: 10,
                                        letterSpacing: "0.04em",
                                      }}
                                    >
                                      READY
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Error detail row */}
                              {isErr && (row.serverErrors ?? []).length > 0 && (
                                <div
                                  style={{
                                    background: "#FDF5F5",
                                    padding: "6px 14px 8px 46px",
                                    borderBottom:
                                      i < reviewRows.length - 1
                                        ? "1px solid #F2F2EE"
                                        : "none",
                                    display: "flex",
                                    gap: 8,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {(row.serverErrors ?? []).map((e, ei) => (
                                    <span
                                      key={ei}
                                      style={{
                                        fontSize: 11,
                                        color: "#C04040",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                      }}
                                    >
                                      <IconAlertCircle size={10} />
                                      {e}
                                      {ei <
                                        (row.serverErrors ?? []).length - 1 && (
                                        <span
                                          style={{
                                            color: "#ecc",
                                            marginLeft: 2,
                                          }}
                                        >
                                          ·
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Import button */}
                    {parseStage === "preview" &&
                      (() => {
                        const readyCount = reviewRows.filter(
                          (r) => r.status !== "error",
                        ).length;
                        return (
                          <div
                            style={{
                              marginTop: 20,
                              display: "flex",
                              alignItems: "center",
                              gap: 14,
                            }}
                          >
                            <button
                              onClick={handleImport}
                              disabled={readyCount === 0}
                              style={{
                                padding: "12px 32px",
                                borderRadius: 9,
                                border: "none",
                                background:
                                  readyCount > 0 ? "#D1FF19" : "#F0F0EA",
                                color: readyCount > 0 ? "#111" : "#bbb",
                                fontSize: 14,
                                fontWeight: 700,
                                cursor:
                                  readyCount > 0 ? "pointer" : "not-allowed",
                              }}
                            >
                              Import {readyCount} Transaction
                              {readyCount !== 1 ? "s" : ""}
                            </button>
                            {errCount > 0 && (
                              <span style={{ fontSize: 12, color: "#bbb" }}>
                                {errCount} row{errCount !== 1 ? "s" : ""} with
                                errors will be skipped
                              </span>
                            )}
                            {submitError && (
                              <span style={{ fontSize: 12, color: "#E05C5C" }}>
                                {submitError}
                              </span>
                            )}
                          </div>
                        );
                      })()}

                    {/* Submitting spinner */}
                    {parseStage === "submitting" && (
                      <div
                        style={{
                          marginTop: 20,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          color: "#bbb",
                          fontSize: 13,
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            border: "2px solid #eee",
                            borderTopColor: "#D1FF19",
                            borderRadius: "50%",
                            animation: "spin 0.7s linear infinite",
                          }}
                        />
                        Importing transactions…
                      </div>
                    )}

                    {/* Success banner */}
                    {parseStage === "done" && importResult && (
                      <div
                        style={{
                          marginTop: 20,
                          padding: "16px 20px",
                          borderRadius: 10,
                          background: "#F0FDF5",
                          border: "1px solid #C4EDD6",
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "#2A9D5C",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <IconCheckCircle />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#1a6640",
                            }}
                          >
                            {importResult.imported} transaction
                            {importResult.imported !== 1 ? "s" : ""} imported
                            successfully
                            {importResult.errors > 0 &&
                              ` · ${importResult.errors} row${importResult.errors !== 1 ? "s" : ""} skipped`}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#5aaa7a",
                              marginTop: 2,
                            }}
                          >
                            Your transactions are now visible in the
                            Transactions page.
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setFile(null);
                            setParsedRows([]);
                            setReviewRows([]);
                            setParseStage("idle");
                            setImportResult(null);
                          }}
                          style={{
                            marginLeft: "auto",
                            padding: "8px 18px",
                            borderRadius: 8,
                            border: "none",
                            background: "#D1FF19",
                            color: "#111",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          Import More
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right panel (dark) */}
              <div className="ie-guide">
                <div
                  style={{
                    background: "#141414",
                    borderRadius: 12,
                    padding: 22,
                    overflowY: "auto",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#D1FF19",
                      marginBottom: 4,
                    }}
                  >
                    Import Guide
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#999",
                      marginBottom: 20,
                      lineHeight: 1.6,
                    }}
                  >
                    Follow these steps to import your transactions without
                    errors.
                  </div>

                  {[
                    {
                      n: "1",
                      title: "Download the template",
                      body: "Use the CSV template so your columns match exactly. Do not rename headers.",
                    },
                    {
                      n: "2",
                      title: "Fill in your data",
                      body: "Add one transaction per row. Dates must be YYYY-MM-DD. Amounts are positive numbers.",
                    },
                    {
                      n: "3",
                      title: "Set the type",
                      body: 'Use "income" or "expense" in the type column to classify each transaction.',
                    },
                    {
                      n: "4",
                      title: "Check categories",
                      body: "Category and sub_category must exactly match names in your Budget app.",
                    },
                    {
                      n: "5",
                      title: "Upload & review",
                      body: "Drop your file in the upload zone. Rows with errors are highlighted — fix them and re-upload.",
                    },
                  ].map((step) => (
                    <div
                      key={step.n}
                      style={{
                        marginBottom: 20,
                        borderBottom: "1px solid #1e1e1e",
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "#1e2d00",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#D1FF19",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        {step.n}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#ccc",
                            marginBottom: 4,
                          }}
                        >
                          {step.title}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#888",
                            lineHeight: 1.6,
                          }}
                        >
                          {step.body}
                        </div>
                      </div>
                    </div>
                  ))}

                  {expenseCategories.length > 0 && (
                    <>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "#777",
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          marginBottom: 10,
                        }}
                      >
                        Expense Categories
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                          marginBottom: 14,
                        }}
                      >
                        {expenseCategories.map((c) => (
                          <div
                            key={c}
                            style={{
                              padding: "4px 9px",
                              borderRadius: 20,
                              background: "#1e1e1e",
                              fontSize: 11,
                              color: "#aaa",
                            }}
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {incomeCategories.length > 0 && (
                    <>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "#777",
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          marginBottom: 10,
                        }}
                      >
                        Income Categories
                      </div>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                      >
                        {incomeCategories.map((c) => (
                          <div
                            key={c}
                            style={{
                              padding: "4px 9px",
                              borderRadius: 20,
                              background: "#1e1e1e",
                              fontSize: 11,
                              color: "#aaa",
                            }}
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── EXPORT TAB ─────────────────────────────────────────── */}
          {tab === "export" && (
            <div className="ie-export-body">
              {/* Left: format cards */}
              <div className="ie-export-left">
                <div
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 24,
                    border: "1px solid #EEEEE8",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                  }}
                >
                  {sectionHead("Export Transactions")}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {[
                      {
                        fmt: "csv" as const,
                        label: "CSV",
                        desc: "Spreadsheet-compatible. Open in Excel, Google Sheets, etc.",
                        icon: "📊",
                      },
                      {
                        fmt: "json" as const,
                        label: "JSON",
                        desc: "Raw data export for developers or custom tools.",
                        icon: "{ }",
                      },
                    ].map((opt) => (
                      <div
                        key={opt.fmt}
                        className="ie-export-card"
                        onClick={() => handleExport(opt.fmt)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: "18px 20px",
                          borderRadius: 10,
                          border: `1.5px solid ${exportFormat === opt.fmt ? "#D1FF19" : "#EEEEE8"}`,
                          background: "#FAFAF8",
                          cursor: exporting ? "wait" : "pointer",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            "#D1FF19";
                          setExportFormat(opt.fmt);
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            exportFormat === opt.fmt ? "#D1FF19" : "#EEEEE8";
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            background: "#111",
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            flexShrink: 0,
                            color: "#D1FF19",
                            fontWeight: 700,
                            fontFamily: "monospace",
                          }}
                        >
                          {opt.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#111",
                            }}
                          >
                            {opt.label}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#aaa",
                              marginTop: 2,
                            }}
                          >
                            {opt.desc}
                          </div>
                        </div>
                        {exporting ? (
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              border: "2px solid #eee",
                              borderTopColor: "#D1FF19",
                              borderRadius: "50%",
                              animation: "spin 0.7s linear infinite",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <IconDownload style={{ opacity: 0.3, flexShrink: 0 }} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Active filter summary */}
                  {(exportFrom || exportTo || exportEventId) && (
                    <div
                      style={{
                        background: "#F5F5F2",
                        borderRadius: 8,
                        padding: "10px 14px",
                        fontSize: 12,
                        color: "#888",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ color: "#555", fontWeight: 600 }}>
                        Filters applied:
                      </span>
                      {exportFrom && <span>From {exportFrom}</span>}
                      {exportTo && <span>To {exportTo}</span>}
                      {exportEventId && (
                        <span>
                          Event:{" "}
                          {events.find((e) => e.id === exportEventId)?.name}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setExportFrom("");
                          setExportTo("");
                          setExportEventId("");
                        }}
                        style={{
                          marginLeft: "auto",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 11,
                          color: "#bbb",
                          padding: 0,
                        }}
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                  {!(exportFrom || exportTo || exportEventId) && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#ccc",
                        background: "#F8F8F5",
                        borderRadius: 8,
                        padding: "12px 16px",
                      }}
                    >
                      No filters — exports all your transactions across all
                      months.
                    </div>
                  )}
                </div>
              </div>

              {/* Right: filter panel */}
              <div className="ie-export-right">
                <div
                  style={{
                    background: "white",
                    borderRadius: 12,
                    border: "1px solid #EEEEE8",
                    padding: 22,
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                  }}
                >
                  {sectionHead("Filters")}

                  {/* Date range */}
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#999",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      Date Range
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <label style={{ fontSize: 11, color: "#bbb" }}>
                          From
                        </label>
                        <input
                          type="date"
                          value={exportFrom}
                          max={exportTo || undefined}
                          onChange={(e) => setExportFrom(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: `1.5px solid ${exportFrom ? "#D1FF19" : "#EEEEE8"}`,
                            fontSize: 12,
                            color: "#333",
                            background: "white",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <label style={{ fontSize: 11, color: "#bbb" }}>
                          To
                        </label>
                        <input
                          type="date"
                          value={exportTo}
                          min={exportFrom || undefined}
                          onChange={(e) => setExportTo(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: `1.5px solid ${exportTo ? "#D1FF19" : "#EEEEE8"}`,
                            fontSize: 12,
                            color: "#333",
                            background: "white",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 1, background: "#F0F0EC" }} />

                  {/* Event filter */}
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#999",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      Event
                    </div>
                    {events.length === 0 ? (
                      <div style={{ fontSize: 12, color: "#ccc" }}>
                        No events found.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {/* "All" option */}
                        <div
                          onClick={() => setExportEventId("")}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            cursor: "pointer",
                            border: `1.5px solid ${!exportEventId ? "#D1FF19" : "#EEEEE8"}`,
                            background: !exportEventId ? "#FAFDE8" : "white",
                            fontSize: 12,
                            color: !exportEventId ? "#111" : "#888",
                            fontWeight: !exportEventId ? 600 : 400,
                            transition: "all 0.12s",
                          }}
                        >
                          All events
                        </div>
                        {events.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => setExportEventId(ev.id)}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 8,
                              cursor: "pointer",
                              border: `1.5px solid ${exportEventId === ev.id ? "#D1FF19" : "#EEEEE8"}`,
                              background:
                                exportEventId === ev.id ? "#FAFDE8" : "white",
                              transition: "all 0.12s",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: exportEventId === ev.id ? 600 : 400,
                                color:
                                  exportEventId === ev.id ? "#111" : "#444",
                              }}
                            >
                              {ev.name}
                            </div>
                            {ev.startDate && (
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "#bbb",
                                  marginTop: 2,
                                }}
                              >
                                {ev.startDate.slice(0, 10)}
                                {ev.endDate
                                  ? ` → ${ev.endDate.slice(0, 10)}`
                                  : ""}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
