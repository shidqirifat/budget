import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  transactionService,
  Transaction,
} from "@/services/transaction.service";
import {
  transactionTypeService,
  TransactionType,
} from "@/services/transaction-type.service";
import {
  categoryService,
  Category,
  SubCategory,
} from "@/services/category.service";
import { eventService, BudgetEvent } from "@/services/event.service";

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

export default function AddTransactionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingTx = location.state?.editingTx as Transaction | undefined;
  const isMobile = useWindowWidth() < 768;

  const [types, setTypes] = useState<TransactionType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCats, setSubCats] = useState<SubCategory[]>([]);
  const [events, setEvents] = useState<BudgetEvent[]>([]);

  const initTypeName = editingTx ? editingTx.type.name : "expense";
  const [typeName, setTypeName] = useState<"income" | "expense">(
    initTypeName as "income" | "expense",
  );
  const [amount, setAmount] = useState(
    editingTx ? String(editingTx.amount) : "",
  );
  const [date, setDate] = useState(
    editingTx
      ? editingTx.date.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );
  const [catId, setCatId] = useState<string>(editingTx?.categoryId || "");
  const [subCatId, setSubCatId] = useState<string>(
    editingTx?.subCategoryId || "",
  );
  const [note, setNote] = useState(editingTx?.note || "");
  const [eventId, setEventId] = useState(editingTx?.eventId || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [saveError, setSaveError] = useState("");
  const amountRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState<{
    amount: string;
    date: string;
    merchant: string;
  } | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  useEffect(() => {
    transactionTypeService
      .getAll()
      .then((r) => setTypes(r.data.data))
      .catch(() => {});
    eventService
      .getAll()
      .then((r) => setEvents(r.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const typeObj = types.find((t) => t.name === typeName);
    if (!typeObj) return;
    categoryService
      .getAll({ typeId: typeObj.id })
      .then((r) => {
        setCategories(r.data.data);
        if (catId && !r.data.data.find((c) => c.id === catId)) {
          setCatId("");
          setSubCatId("");
        }
      })
      .catch(() => {});
  }, [typeName, types]);

  useEffect(() => {
    if (!catId) {
      setSubCats([]);
      setSubCatId("");
      return;
    }
    categoryService
      .getSubCategories(catId)
      .then((r) => {
        setSubCats(r.data.data);
        if (subCatId && !r.data.data.find((s) => s.id === subCatId))
          setSubCatId("");
      })
      .catch(() => {});
  }, [catId]);

  const typeObj = types.find((t) => t.name === typeName);
  const amtColor = typeName === "income" ? "#2A9D5C" : "#E05C5C";

  const fakeParseReceipt = () =>
    setParsed({
      amount: "250.000",
      date: new Date().toISOString().slice(0, 10),
      merchant: "Alfamart",
    });

  async function handleSave() {
    if (!typeObj) return;
    let valid = true;
    if (!amount || Number(amount) <= 0) {
      setAmountError("Enter a valid amount.");
      amountRef.current?.focus();
      valid = false;
    } else {
      setAmountError("");
    }
    if (!catId) {
      setCategoryError("Select a category.");
      if (valid) categoryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      valid = false;
    } else {
      setCategoryError("");
    }
    if (!valid) return;
    setSaveError("");
    setSaving(true);
    try {
      const payload = {
        amount: Number(amount),
        typeId: typeObj.id,
        categoryId: catId,
        subCategoryId: subCatId || undefined,
        eventId: eventId || undefined,
        date: new Date(date).toISOString(),
        note: note || undefined,
      };
      if (editingTx) {
        await transactionService.update(editingTx.id, payload);
      } else {
        await transactionService.create(payload);
      }
      navigate(-1);
    } catch {
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingTx) return;
    if (!window.confirm("Delete this transaction? This cannot be undone."))
      return;
    setDeleting(true);
    setSaveError("");
    try {
      await transactionService.remove(editingTx.id);
      navigate(-1);
    } catch {
      setSaveError("Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const sectionHead = (label: string, note?: string) => (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#aaa",
        letterSpacing: "0.07em",
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

  return (
    <div
      style={{
        height: isMobile ? undefined : "100%",
        minHeight: isMobile ? undefined : undefined,
        display: "flex",
        flexDirection: "column",
        background: "#F5F5F2",
        overflow: isMobile ? undefined : "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: isMobile ? "14px 16px" : "18px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "white",
          borderBottom: "1px solid #EEEEE8",
          flexShrink: 0,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#999",
              fontSize: 13,
              padding: "6px 0",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8l5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {!isMobile && "Back"}
          </button>
          <div style={{ width: 1, height: 20, background: "#eee" }} />
          <h1
            style={{
              fontSize: isMobile ? 16 : 18,
              fontWeight: 700,
              color: "#111",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {editingTx ? "Edit Transaction" : "New Transaction"}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {saveError && (
            <span style={{ fontSize: 12, color: "#E05C5C" }}>{saveError}</span>
          )}
          {editingTx && (
            <button
              onClick={handleDelete}
              disabled={deleting || saving}
              style={{
                padding: isMobile ? "8px 14px" : "10px 20px",
                borderRadius: 8,
                border: "1.5px solid #F5C0C0",
                background: deleting ? "#FDF5F5" : "white",
                color: "#E05C5C",
                fontSize: 13,
                fontWeight: 600,
                cursor: deleting || saving ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!deleting && !saving)
                  (e.currentTarget as HTMLElement).style.background = "#FDF0F0";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = deleting
                  ? "#FDF5F5"
                  : "white";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M6 6.5v3M8 6.5v3M3 3.5l.7 7.3a.5.5 0 0 0 .5.45h5.6a.5.5 0 0 0 .5-.45L11 3.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || deleting}
            style={{
              padding: isMobile ? "8px 12px" : "10px 28px",
              borderRadius: 8,
              border: "none",
              background: saving ? "#e8f5a8" : "#D1FF19",
              color: "#111",
              fontSize: 13,
              fontWeight: 700,
              cursor: saving || deleting ? "default" : "pointer",
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {isMobile ? (
              saving ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                  <circle cx="9" cy="9" r="7" stroke="#555" strokeWidth="2" strokeDasharray="30 14" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9l4.5 4.5L15 5" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )
            ) : (
              saving ? "Saving…" : "Save Transaction"
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 20,
          padding: isMobile ? "16px" : "24px 32px",
          overflow: isMobile ? undefined : "hidden",
        }}
      >
        {/* Mobile: collapsible receipt panel above form */}
        {isMobile && (
          <div style={{ borderRadius: 12, overflow: "hidden", background: "#141414" }}>
            <button
              onClick={() => setReceiptOpen((v) => !v)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>📷</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#D1FF19" }}>Receipt Scanner</span>
              </div>
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                style={{ transition: "transform 0.2s", transform: receiptOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <path d="M3 6l5 5 5-5" stroke="#888" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div
              style={{
                maxHeight: receiptOpen ? 600 : 0,
                overflow: "hidden",
                transition: "max-height 0.3s ease",
              }}
            >
              <div style={{ padding: "0 18px 18px" }}>
                <div style={{ fontSize: 12, color: "#aaa", marginBottom: 18, lineHeight: 1.5 }}>
                  Upload a receipt image to auto-fill fields above.
                </div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); fakeParseReceipt(); }}
                  onClick={fakeParseReceipt}
                  style={{
                    border: `2px dashed ${dragOver ? "#D1FF19" : "#272727"}`,
                    borderRadius: 10,
                    padding: "28px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: dragOver ? "#182300" : "#1a1a1a",
                  }}
                >
                  <div style={{ fontSize: 30 }}>📷</div>
                  <div style={{ fontSize: 12, color: "#999", textAlign: "center", lineHeight: 1.5 }}>
                    Drag & drop receipt<br />or click to browse
                  </div>
                </div>
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #2a2a2a" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#888", letterSpacing: "0.07em", marginBottom: 12 }}>
                    PARSED FROM RECEIPT
                  </div>
                  {(
                    [["Amount", parsed?.amount || "—"], ["Date", parsed?.date || "—"], ["Merchant", parsed?.merchant || "—"]] as [string, string][]
                  ).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #2a2a2a" }}>
                      <span style={{ fontSize: 12, color: "#aaa" }}>{k}</span>
                      <span style={{ fontSize: 12, color: parsed ? "#D1FF19" : "#666", fontWeight: parsed ? 600 : 400 }}>{v}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => { if (parsed) { setAmount("250000"); setDate(new Date().toISOString().slice(0, 10)); setNote("Alfamart"); } }}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: parsed ? "#1e2d00" : "#1a1a1a", color: parsed ? "#D1FF19" : "#666", fontSize: 12, fontWeight: 700, cursor: parsed ? "pointer" : "default", transition: "all 0.15s" }}
                  >
                    Apply to Form →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Left: form */}
        <div
          style={{
            flex: 1,
            overflowY: isMobile ? undefined : "auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Type + Amount */}
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: isMobile ? 16 : 24,
              border: "1px solid #EEEEE8",
            }}
          >
            <div
              style={{
                display: "flex",
                background: "#F5F5F2",
                borderRadius: 8,
                padding: 4,
                width: "fit-content",
                marginBottom: 22,
              }}
            >
              {(["expense", "income"] as const).map((t) => {
                const sel = typeName === t;
                const bg = sel
                  ? t === "income"
                    ? "#EDFDF5"
                    : "#FDF0F0"
                  : "transparent";
                const col = sel
                  ? t === "income"
                    ? "#2A9D5C"
                    : "#E05C5C"
                  : "#999";
                const label = t === "income" ? "Inflow" : "Outflow";
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setTypeName(t);
                      setCatId("");
                      setSubCatId("");
                    }}
                    style={{
                      padding: "8px 22px",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      background: bg,
                      color: col,
                      fontSize: 13,
                      fontWeight: sel ? 700 : 400,
                      transition: "all 0.12s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {sectionHead("AMOUNT")}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: "#ccc" }}>
                {typeName === "expense" ? "-" : "+"} Rp
              </span>
              <input
                ref={amountRef}
                value={amount ? parseInt(amount).toLocaleString("id-ID") : ""}
                onChange={(e) => { setAmount(e.target.value.replace(/\D/g, "")); setAmountError(""); }}
                placeholder="0"
                style={{
                  fontSize: isMobile ? 28 : 34,
                  fontWeight: 700,
                  border: "none",
                  outline: "none",
                  color: amountError ? "#E05C5C" : amtColor,
                  background: "transparent",
                  width: "100%",
                  letterSpacing: "-0.02em",
                }}
              />
            </div>
            {amountError && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#E05C5C", display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="6" stroke="#E05C5C" strokeWidth="1.3" />
                  <path d="M6.5 4v3M6.5 8.5v.5" stroke="#E05C5C" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {amountError}
              </div>
            )}
          </div>

          {/* Date */}
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: isMobile ? 16 : 24,
              border: "1px solid #EEEEE8",
            }}
          >
            {sectionHead("DATE")}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                fontSize: 14,
                fontWeight: 500,
                border: "1px solid #E5E5E0",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#333",
                background: "#FAFAF8",
                outline: "none",
                cursor: "pointer",
                width: isMobile ? "100%" : undefined,
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Category */}
          <div
            ref={categoryRef}
            style={{
              background: "white",
              borderRadius: 12,
              padding: isMobile ? 16 : 24,
              border: `1px solid ${categoryError ? "#F5C0C0" : "#EEEEE8"}`,
            }}
          >
            {sectionHead("CATEGORY")}
            {categories.length === 0 ? (
              <div style={{ fontSize: 13, color: "#bbb" }}>
                Loading categories…
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {categories.map((cat) => {
                  const sel = catId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setCatId(cat.id);
                        setSubCatId("");
                        setCategoryError("");
                      }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        padding: "12px 14px",
                        borderRadius: 10,
                        cursor: "pointer",
                        minWidth: 76,
                        border: `2px solid ${sel ? "#D1FF19" : "#EEEEE8"}`,
                        background: sel ? "#FAFDE8" : "white",
                        transition: "all 0.12s",
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          background: sel ? "#EEFFC0" : "#F0F0EE",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#888",
                        }}
                      >
                        {cat.name.slice(0, 1).toUpperCase()}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: sel ? 700 : 400,
                          color: sel ? "#111" : "#777",
                          textAlign: "center",
                          lineHeight: 1.2,
                        }}
                      >
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {catId && (
              <div
                style={{
                  marginTop: 18,
                  paddingTop: 18,
                  borderTop: "1px solid #F2F2EE",
                }}
              >
                {sectionHead("SUB-CATEGORY", "(optional)")}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {subCats.map((s) => {
                    const sel = subCatId === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSubCatId(sel ? "" : s.id)}
                        style={{
                          padding: "7px 16px",
                          borderRadius: 20,
                          border: "none",
                          cursor: "pointer",
                          background: sel ? "#111" : "#F2F2EE",
                          color: sel ? "#D1FF19" : "#666",
                          fontSize: 12,
                          fontWeight: sel ? 600 : 400,
                          transition: "all 0.12s",
                        }}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                  {subCats.length === 0 && (
                    <span style={{ fontSize: 12, color: "#bbb" }}>
                      No sub-categories.
                    </span>
                  )}
                </div>
              </div>
            )}
            {categoryError && (
              <div style={{ marginTop: 12, fontSize: 12, color: "#E05C5C", display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="6" stroke="#E05C5C" strokeWidth="1.3" />
                  <path d="M6.5 4v3M6.5 8.5v.5" stroke="#E05C5C" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {categoryError}
              </div>
            )}
          </div>

          {/* Note + Event */}
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: isMobile ? 16 : 24,
              border: "1px solid #EEEEE8",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 16 : 20,
            }}
          >
            <div style={{ flex: 2 }}>
              {sectionHead("NOTE")}
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note…"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #E5E5E0",
                  fontSize: 13,
                  color: "#333",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: isMobile ? undefined : 1 }}>
              {sectionHead("LINK EVENT", "(optional)")}
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #E5E5E0",
                  fontSize: 13,
                  color: eventId ? "#333" : "#aaa",
                  outline: "none",
                  background: "white",
                  boxSizing: "border-box",
                }}
              >
                <option value="">No event</option>
                {events
                  .filter((ev) => {
                    const start = ev.startDate.slice(0, 10);
                    const end = ev.endDate ? ev.endDate.slice(0, 10) : '';
                    const today = new Date().toISOString().slice(0, 10);
                    return start <= today && (!end || today <= end);
                  })
                  .map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right: receipt panel (desktop only) */}
        {!isMobile && <div style={{ width: 288, flexShrink: 0 }}>
          <div
            style={{
              background: "#141414",
              borderRadius: 12,
              padding: 22,
              position: isMobile ? undefined : "sticky",
              top: isMobile ? undefined : 0,
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
              Receipt Scanner
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#aaa",
                marginBottom: 18,
                lineHeight: 1.5,
              }}
            >
              Upload a receipt image to auto-fill fields above.
            </div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                fakeParseReceipt();
              }}
              onClick={fakeParseReceipt}
              style={{
                border: `2px dashed ${dragOver ? "#D1FF19" : "#272727"}`,
                borderRadius: 10,
                padding: "32px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                transition: "all 0.15s",
                background: dragOver ? "#182300" : "#1a1a1a",
              }}
            >
              <div style={{ fontSize: 30 }}>📷</div>
              <div
                style={{
                  fontSize: 12,
                  color: "#999",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                Drag & drop receipt
                <br />
                or click to browse
              </div>
            </div>
            <div
              style={{
                marginTop: 18,
                paddingTop: 18,
                borderTop: "1px solid #2a2a2a",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#888",
                  letterSpacing: "0.07em",
                  marginBottom: 12,
                }}
              >
                PARSED FROM RECEIPT
              </div>
              {(
                [
                  ["Amount", parsed?.amount || "—"],
                  ["Date", parsed?.date || "—"],
                  ["Merchant", parsed?.merchant || "—"],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    paddingBottom: 10,
                    borderBottom: "1px solid #2a2a2a",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#aaa" }}>{k}</span>
                  <span
                    style={{
                      fontSize: 12,
                      color: parsed ? "#D1FF19" : "#666",
                      fontWeight: parsed ? 600 : 400,
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
              <button
                onClick={() => {
                  if (parsed) {
                    setAmount("250000");
                    setDate(new Date().toISOString().slice(0, 10));
                    setNote("Alfamart");
                  }
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  border: "none",
                  background: parsed ? "#1e2d00" : "#1a1a1a",
                  color: parsed ? "#D1FF19" : "#666",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: parsed ? "pointer" : "default",
                  transition: "all 0.15s",
                }}
              >
                Apply to Form →
              </button>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
