import { useState } from "react";

export interface ParsedReceipt {
  amount: string;
  date: string;
  merchant: string;
}

export interface ReceiptScannerState {
  dragOver: boolean;
  parsed: ParsedReceipt | null;
  receiptOpen: boolean;
  setReceiptOpen: (v: boolean) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClickUpload: () => void;
  applyToForm: (setters: {
    setAmount: (v: string) => void;
    setDate: (v: string) => void;
    setNote: (v: string) => void;
  }) => void;
}

export function useReceiptScanner(): ReceiptScannerState {
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const fakeParseReceipt = () =>
    setParsed({
      amount: "250.000",
      date: new Date().toISOString().slice(0, 10),
      merchant: "Alfamart",
    });

  function applyToForm(setters: {
    setAmount: (v: string) => void;
    setDate: (v: string) => void;
    setNote: (v: string) => void;
  }) {
    if (!parsed) return;
    setters.setAmount("250000");
    setters.setDate(new Date().toISOString().slice(0, 10));
    setters.setNote("Alfamart");
  }

  return {
    dragOver,
    parsed,
    receiptOpen,
    setReceiptOpen,
    onDragOver: (e) => { e.preventDefault(); setDragOver(true); },
    onDragLeave: () => setDragOver(false),
    onDrop: (e) => { e.preventDefault(); setDragOver(false); fakeParseReceipt(); },
    onClickUpload: fakeParseReceipt,
    applyToForm,
  };
}
