import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  transactionService,
  ImportRowPayload,
  ImportRowResult,
} from "@/services/transaction.service";
import { parseWorkbook } from "@/utils/xlsx";
import type { ParsedRow, ReviewRow } from "@/types/import";
import { useImportCategories } from "./useImportCategories";

export function useImport() {
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

  const { expenseCategories, incomeCategories } = useImportCategories();

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
          if (!r) return { ...row, status: "pending" as const };
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

  const downloadTemplate = useCallback(() => {
    const wb = XLSX.utils.book_new();

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
    ws1["!cols"] = [
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
    ];
    ws1["!freeze"] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(wb, ws1, "Import Data");

    const expenseRows = expenseCategories.map((c) => ["expense", c]);
    const incomeRows = incomeCategories.map((c) => ["income", c]);
    const ws2 = XLSX.utils.aoa_to_sheet([
      ["type", "category"],
      ...expenseRows,
      ...incomeRows,
    ]);
    ws2["!cols"] = [{ wch: 12 }, { wch: 24 }];
    ws2["!freeze"] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(wb, ws2, "Categories");

    XLSX.writeFile(wb, "template.xlsx");
  }, [expenseCategories, incomeCategories]);

  const resetImport = useCallback(() => {
    setFile(null);
    setParsedRows([]);
    setReviewRows([]);
    setParseStage("idle");
    setImportResult(null);
  }, []);

  const okCount = reviewRows.filter(
    (r) => r.status === "ok" || r.status === "pending",
  ).length;
  const errCount = reviewRows.filter((r) => r.status === "error").length;

  return {
    dragOver,
    setDragOver,
    file,
    parsedRows,
    reviewRows,
    parseStage,
    importResult,
    submitError,
    fileRef,
    expenseCategories,
    incomeCategories,
    loadFile,
    handleDrop,
    handleFileInput,
    handleImport,
    downloadTemplate,
    resetImport,
    okCount,
    errCount,
  };
}
