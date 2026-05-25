import * as XLSX from "xlsx";
import type { ParsedRow } from "@/types/import";

export function xlsxDateToISO(val: unknown): string {
  if (val === null || val === undefined || val === "") return "";
  if (typeof val === "string") {
    const s = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return s;
  }
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

export function parseWorkbook(buffer: ArrayBuffer): ParsedRow[] {
  const wb = XLSX.read(buffer, { type: "array", cellDates: false });
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
