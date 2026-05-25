import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { transactionService, Transaction } from "@/services/transaction.service";
import { transactionTypeService, TransactionType } from "@/services/transaction-type.service";
import { categoryService, Category, SubCategory } from "@/services/category.service";
import { eventService, BudgetEvent } from "@/services/event.service";

export interface TransactionFormState {
  typeName: "income" | "expense";
  amount: string;
  date: string;
  catId: string;
  subCatId: string;
  note: string;
  eventId: string;
  saving: boolean;
  deleting: boolean;
  amountError: string;
  categoryError: string;
  saveError: string;
  types: TransactionType[];
  categories: Category[];
  subCats: SubCategory[];
  events: BudgetEvent[];
  editingTx: Transaction | undefined;
  amountRef: React.RefObject<HTMLInputElement>;
  categoryRef: React.RefObject<HTMLDivElement>;
  setTypeName: (t: "income" | "expense") => void;
  setAmount: (v: string) => void;
  setAmountError: (v: string) => void;
  setDate: (v: string) => void;
  setCatId: (v: string) => void;
  setSubCatId: (v: string) => void;
  setCategoryError: (v: string) => void;
  setNote: (v: string) => void;
  setEventId: (v: string) => void;
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
}

export function useTransactionForm(): TransactionFormState {
  const navigate = useNavigate();
  const location = useLocation();
  const editingTx = location.state?.editingTx as Transaction | undefined;

  const [types, setTypes] = useState<TransactionType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCats, setSubCats] = useState<SubCategory[]>([]);
  const [events, setEvents] = useState<BudgetEvent[]>([]);

  const initTypeName = editingTx ? editingTx.type.name : "expense";
  const [typeName, setTypeName] = useState<"income" | "expense">(initTypeName as "income" | "expense");
  const [amount, setAmount] = useState(editingTx ? String(editingTx.amount) : "");
  const [date, setDate] = useState(
    editingTx ? editingTx.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
  );
  const [catId, setCatId] = useState<string>(editingTx?.categoryId || "");
  const [subCatId, setSubCatId] = useState<string>(editingTx?.subCategoryId || "");
  const [note, setNote] = useState(editingTx?.note || "");
  const [eventId, setEventId] = useState(editingTx?.eventId || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [saveError, setSaveError] = useState("");

  const amountRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transactionTypeService.getAll().then((r) => setTypes(r.data.data)).catch(() => {});
    eventService.getAll().then((r) => setEvents(r.data.data)).catch(() => {});
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
        if (subCatId && !r.data.data.find((s) => s.id === subCatId)) setSubCatId("");
      })
      .catch(() => {});
  }, [catId]);

  const typeObj = types.find((t) => t.name === typeName);

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
    if (!window.confirm("Delete this transaction? This cannot be undone.")) return;
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

  return {
    typeName,
    amount,
    date,
    catId,
    subCatId,
    note,
    eventId,
    saving,
    deleting,
    amountError,
    categoryError,
    saveError,
    types,
    categories,
    subCats,
    events,
    editingTx,
    amountRef,
    categoryRef,
    setTypeName,
    setAmount,
    setAmountError,
    setDate,
    setCatId,
    setSubCatId,
    setCategoryError,
    setNote,
    setEventId,
    handleSave,
    handleDelete,
  };
}
