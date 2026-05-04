import { useState, useEffect, useCallback, useRef } from "react";
import { formatCurrency as formatRp } from "@/utils/format";
import {
  categoryService,
  Category,
  SubCategory,
  CategoryStats,
} from "@/services/category.service";
import {
  transactionTypeService,
  TransactionType,
} from "@/services/transaction-type.service";

const EMOJI_LIST = [
  "🏠",
  "🏡",
  "👨‍👩‍👧‍👦",
  "👪",
  "🏘️",
  "📈",
  "💹",
  "🏦",
  "💰",
  "💵",
  "💳",
  "🪙",
  "🍽️",
  "🍔",
  "🍜",
  "☕",
  "🥗",
  "🍕",
  "🛒",
  "🚗",
  "🚌",
  "✈️",
  "🚂",
  "⛽",
  "🛵",
  "🚇",
  "🏥",
  "💊",
  "🩺",
  "🏋️",
  "🧘",
  "🩻",
  "📚",
  "🎓",
  "✏️",
  "📖",
  "🖥️",
  "🎒",
  "💡",
  "🔌",
  "💧",
  "📡",
  "🏗️",
  "🔧",
  "🛍️",
  "👗",
  "📱",
  "🖨️",
  "🪑",
  "🧹",
  "🎬",
  "🎮",
  "🎵",
  "🎨",
  "🎭",
  "🎪",
  "🌴",
  "🌊",
  "⛺",
  "🏕️",
  "🗺️",
  "🎡",
  "🐶",
  "🐱",
  "🐾",
  "🌿",
  "🌸",
  "🌻",
  "🎁",
  "🎉",
  "🎂",
  "💝",
  "🤝",
  "🙏",
  "📊",
  "📋",
  "📌",
  "🗂️",
  "💼",
  "🔑",
  "⚽",
  "🏀",
  "🎾",
  "🏊",
  "🚴",
  "🥊",
];

function EmojiPicker({
  onSelect,
  onClose,
}: {
  onSelect: (e: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        zIndex: 100,
        background: "white",
        border: "1px solid #E5E5E0",
        borderRadius: 12,
        padding: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      <div className="w-80"></div>
      {EMOJI_LIST.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          style={{
            fontSize: 20,
            padding: 4,
            border: "none",
            background: "none",
            cursor: "pointer",
            borderRadius: 6,
            lineHeight: 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F5F2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

function Avatar({
  icon,
  name,
  size = 34,
}: {
  icon: string | null;
  name: string;
  size?: number;
}) {
  if (icon) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#F5F5F2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.5,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#F0F0EA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        flexShrink: 0,
        color: "#666",
        fontWeight: 700,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

const MiniBar = ({ stats }: { stats: CategoryStats | null }) => {
  if (!stats) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 11, color: "#ccc" }}>Loading…</span>
      </div>
    );
  }
  const max = Math.max(...stats.months.map((m) => m.total), 1);
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 44 }}
      >
        {stats.months.map((m, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: Math.max((m.total / max) * 44, m.total > 0 ? 4 : 0),
              borderRadius: "3px 3px 0 0",
              background: i === stats.months.length - 1 ? "#D1FF19" : "#EBEBEB",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 5,
        }}
      >
        {stats.months.map((m, i) => (
          <span
            key={i}
            style={{
              fontSize: 10,
              color: i === stats.months.length - 1 ? "#888" : "#ccc",
              fontWeight: i === stats.months.length - 1 ? 700 : 400,
            }}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [subs, setSubs] = useState<SubCategory[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [types, setTypes] = useState<TransactionType[]>([]);
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [editName, setEditName] = useState("");
  const [editTypeId, setEditTypeId] = useState("");
  const [editIcon, setEditIcon] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [newSub, setNewSub] = useState("");
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingSubName, setEditingSubName] = useState("");
  const [editingSubIcon, setEditingSubIcon] = useState<string | null>(null);
  const [showSubIconPicker, setShowSubIconPicker] = useState(false);
  const [newSubIcon, setNewSubIcon] = useState<string | null>(null);
  const [showNewSubIconPicker, setShowNewSubIconPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selected = cats.find((c) => c.id === selectedId) ?? null;

  const loadCategories = useCallback(async () => {
    try {
      const res = await categoryService.getAll();
      const list = res.data.data;
      setCats(list);
      if (!selectedId && list.length && window.innerWidth >= 640) setSelectedId(list[0].id);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    transactionTypeService
      .getAll()
      .then((res) => setTypes(res.data.data))
      .catch(() => {});
    loadCategories();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setSubs([]);
    setStats(null);
    setEditingSubId(null);
    setShowIconPicker(false);
    categoryService
      .getSubCategories(selectedId)
      .then((res) => setSubs(res.data.data))
      .catch(() => {});
    categoryService
      .getStats(selectedId)
      .then((res) => setStats(res.data.data))
      .catch(() => {});
  }, [selectedId]);

  useEffect(() => {
    if (selected) {
      setEditName(selected.name);
      setEditTypeId(selected.typeId);
      setEditIcon(selected.icon);
      setSaved(false);
    }
  }, [selectedId]);

  const handleSelectCategory = (id: string) => {
    setSelectedId(id);
    setMobileView("detail");
  };

  const handleAddCategory = async () => {
    if (!types.length) return;
    const tabType = types.find((t) => t.name === activeTab) ?? types[0];
    try {
      const res = await categoryService.create({
        name: "New Category",
        typeId: tabType.id,
        icon: null,
      });
      const newCat = res.data.data;
      setCats((prev) => [...prev, newCat]);
      setSelectedId(newCat.id);
    } catch {
      setError("Failed to create category");
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      const res = await categoryService.update(selected.id, {
        name: editName,
        typeId: editTypeId,
        icon: editIcon,
      });
      const updated = res.data.data;
      setCats((prev) =>
        prev.map((c) => (c.id === selected.id ? { ...c, ...updated } : c)),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to save changes");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await categoryService.remove(selected.id);
      const remaining = cats.filter((c) => c.id !== selected.id);
      setCats(remaining);
      setSelectedId(remaining.length ? remaining[0].id : null);
    } catch {
      setError("Failed to delete category");
    }
  };

  const handleAddSub = async () => {
    const v = newSub.trim();
    if (!v || !selectedId) return;
    try {
      const res = await categoryService.createSubCategory(selectedId, {
        name: v,
        icon: newSubIcon,
      });
      setSubs((prev) => [...prev, res.data.data]);
      setNewSub("");
      setNewSubIcon(null);
    } catch {
      setError("Failed to add sub-category");
    }
  };

  const handleStartEditSub = (sub: SubCategory) => {
    setEditingSubId(sub.id);
    setEditingSubName(sub.name);
    setEditingSubIcon(sub.icon);
    setShowSubIconPicker(false);
  };

  const handleSaveSub = async (sub: SubCategory) => {
    const v = editingSubName.trim();
    if (!v) return;
    try {
      const res = await categoryService.updateSubCategory(sub.id, {
        name: v,
        icon: editingSubIcon,
      });
      setSubs((prev) =>
        prev.map((s) =>
          s.id === sub.id
            ? { ...s, name: res.data.data.name, icon: res.data.data.icon }
            : s,
        ),
      );
      setEditingSubId(null);
      setShowSubIconPicker(false);
    } catch {
      setError("Failed to update sub-category");
    }
  };

  const handleRemoveSub = async (sub: SubCategory) => {
    try {
      await categoryService.removeSubCategory(sub.id);
      setSubs((prev) => prev.filter((s) => s.id !== sub.id));
    } catch {
      setError("Cannot remove this sub-category");
    }
  };

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

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F5F2",
        }}
      >
        <span style={{ color: "#aaa", fontSize: 14 }}>Loading categories…</span>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#F5F5F2",
        overflow: "hidden",
      }}
    >
      {error && (
        <div
          style={{
            padding: "8px 32px",
            background: "#FDF0F0",
            borderBottom: "1px solid #FDEAEA",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 13, color: "#E05C5C" }}>{error}</span>
          <span
            onClick={() => setError(null)}
            style={{ fontSize: 13, color: "#E05C5C", cursor: "pointer" }}
          >
            ✕
          </span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          padding: "28px 32px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
        className="px-4 sm:px-8"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {mobileView === "detail" && (
            <button
              className="sm:hidden"
              onClick={() => setMobileView("list")}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid #E5E5E0",
                background: "white",
                color: "#333",
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              ← Back
            </button>
          )}
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#111",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {mobileView === "detail" && selected ? selected.name : "Categories"}
          </h1>
        </div>
        {mobileView === "list" && (
          <button
            onClick={handleAddCategory}
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
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>{" "}
            <span className="hidden sm:inline">New Category</span>
            <span className="sm:hidden">New</span>
          </button>
        )}
      </div>

      {/* Two panels */}
      <div
        style={{
          display: "flex",
          flex: 1,
          padding: "0 32px 32px",
          gap: 20,
          overflow: "hidden",
        }}
        className="!px-4 sm:!px-8"
      >
        {/* Left list */}
        <div
          style={{
            width: 256,
            flexShrink: 0,
            background: "white",
            borderRadius: 12,
            border: "1px solid #EEEEE8",
            overflow: "hidden",
            flexDirection: "column",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
          className={
            mobileView === "detail" ? "hidden sm:flex" : "flex !w-full sm:!w-64"
          }
        >
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #F2F2EE",
              flexShrink: 0,
            }}
          >
            {(["expense", "income"] as const).map((tab) => {
              const isActive = activeTab === tab;
              const color = tab === "income" ? "#2A9D5C" : "#E05C5C";
              const count = cats.filter((c) => c.type.name === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    borderBottom: isActive
                      ? `2px solid ${color}`
                      : "2px solid transparent",
                    marginBottom: -1,
                    transition: "border-color 0.15s",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      color: isActive ? color : "#bbb",
                    }}
                  >
                    {tab.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      marginLeft: 5,
                      color: isActive ? color : "#ccc",
                      fontWeight: 400,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {cats
              .filter((c) => c.type.name === activeTab)
              .map((cat) => {
                const active = selectedId === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className="cat-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 16px",
                      cursor: "pointer",
                      transition: "background 0.1s",
                      background: active ? "#FAFDE8" : "white",
                      borderBottom: "1px solid #F8F8F4",
                      borderLeft: `3px solid ${active ? "#D1FF19" : "transparent"}`,
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
                    <Avatar icon={cat.icon} name={cat.name} size={32} />
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
                        {cat.name}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}
                      >
                        {cat._count?.subCategories &&
                        cat._count.subCategories > 0
                          ? `${cat._count.subCategories} sub-categories`
                          : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            {cats.filter((c) => c.type.name === activeTab).length === 0 && (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "#ccc",
                  fontSize: 13,
                }}
              >
                No categories yet
              </div>
            )}
          </div>
        </div>

        {/* Right detail */}
        <div
          style={{
            flex: 1,
            background: "white",
            borderRadius: 12,
            border: "1px solid #EEEEE8",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
          className={mobileView === "list" ? "hidden sm:flex" : "flex"}
        >
          {selected ? (
            <>
              {/* Detail header */}
              <div
                style={{
                  padding: "22px 28px",
                  borderBottom: "1px solid #F2F2EE",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexShrink: 0,
                }}
                className="hidden sm:flex"
              >
                <Avatar icon={selected.icon} name={selected.name} size={50} />
                <div>
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
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                    {subs.length} sub-categories · {selected.type.name}
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
                {/* Icon + Name + Type */}
                <style>{`
                  @media (max-width: 399px) {
                    .cat-form { display: flex; flex-direction: column; gap: 12px; }
                    .cat-form-type { flex: unset !important; width: 100%; }
                  }
                  @media (min-width: 400px) {
                    .cat-form { display: flex; flex-direction: row; gap: 12px; align-items: flex-end; }
                    .cat-form-type { flex: 1; }
                  }
                  @media (max-width: 639px) {
                    .cat-item { background: white !important; border-left-color: transparent !important; }
                  }
                `}</style>
                <div style={{ marginBottom: 26 }} className="cat-form">
                  {/* Icon + Name row (always together) */}
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-end",
                      flex: 2,
                      minWidth: 0,
                    }}
                  >
                    {/* Icon picker trigger */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      {sectionHead("ICON")}
                      <button
                        onClick={() => setShowIconPicker((p) => !p)}
                        style={{
                          width: 46,
                          height: 42,
                          borderRadius: 8,
                          border: "1px solid #E5E5E0",
                          background: "white",
                          cursor: "pointer",
                          fontSize: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {editIcon ?? (
                          <span style={{ fontSize: 18, color: "#ccc" }}>
                            ＋
                          </span>
                        )}
                      </button>
                      {editIcon && (
                        <button
                          onClick={() => setEditIcon(null)}
                          style={{
                            position: "absolute",
                            top: 22,
                            right: -6,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border: "none",
                            background: "#E5E5E0",
                            color: "#666",
                            fontSize: 9,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 1,
                          }}
                        >
                          ✕
                        </button>
                      )}
                      {showIconPicker && (
                        <div style={{ position: "absolute", top: 70, left: 0 }}>
                          <EmojiPicker
                            onSelect={(e) => {
                              setEditIcon(e);
                              setShowIconPicker(false);
                            }}
                            onClose={() => setShowIconPicker(false)}
                          />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {sectionHead("CATEGORY NAME")}
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: 8,
                          border: "1px solid #E5E5E0",
                          fontSize: 14,
                          color: "#111",
                          outline: "none",
                          boxSizing: "border-box",
                          fontWeight: 500,
                        }}
                      />
                    </div>
                  </div>

                  <div className="cat-form-type">
                    {sectionHead("TYPE")}
                    <select
                      value={editTypeId}
                      onChange={(e) => setEditTypeId(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #E5E5E0",
                        fontSize: 14,
                        color: "#333",
                        outline: "none",
                        background: "white",
                        boxSizing: "border-box",
                      }}
                    >
                      {types.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name.charAt(0).toUpperCase() + t.name.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub-categories */}
                <div style={{ marginBottom: 26 }}>
                  {sectionHead("SUB-CATEGORIES")}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      marginBottom: 12,
                    }}
                  >
                    {subs.map((s) => (
                      <div
                        key={s.id}
                        style={{
                          display: "flex",
                          alignItems: editingSubId === s.id ? "stretch" : "center",
                          flexDirection: editingSubId === s.id ? "column" : "row",
                          gap: 8,
                          padding: "7px 12px",
                          borderRadius: 8,
                          background: "#F9F9F7",
                          border: "1px solid #EEEEE8",
                        }}
                      >
                        {editingSubId === s.id ? (
                          <>
                            {/* Icon + input row */}
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              {/* Sub icon picker */}
                              <div
                                style={{ position: "relative", flexShrink: 0 }}
                              >
                                <button
                                  onClick={() => setShowSubIconPicker((p) => !p)}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 6,
                                    border: "1px solid #E5E5E0",
                                    background: "white",
                                    cursor: "pointer",
                                    fontSize: 16,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {editingSubIcon ?? (
                                    <span style={{ fontSize: 14, color: "#ccc" }}>
                                      ＋
                                    </span>
                                  )}
                                </button>
                                {showSubIconPicker && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: 36,
                                      left: 0,
                                      zIndex: 50,
                                    }}
                                  >
                                    <EmojiPicker
                                      onSelect={(e) => {
                                        setEditingSubIcon(e);
                                        setShowSubIconPicker(false);
                                      }}
                                      onClose={() => setShowSubIconPicker(false)}
                                    />
                                  </div>
                                )}
                              </div>
                              <input
                                autoFocus
                                value={editingSubName}
                                onChange={(e) =>
                                  setEditingSubName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveSub(s);
                                  if (e.key === "Escape") {
                                    setEditingSubId(null);
                                    setShowSubIconPicker(false);
                                  }
                                }}
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  padding: "4px 8px",
                                  borderRadius: 6,
                                  border: "1px solid #D1FF19",
                                  fontSize: 13,
                                  color: "#111",
                                  outline: "none",
                                  background: "white",
                                }}
                              />
                            </div>
                            {/* Save / Cancel row */}
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                onClick={() => handleSaveSub(s)}
                                style={{
                                  flex: 1,
                                  padding: "6px 12px",
                                  borderRadius: 6,
                                  border: "none",
                                  background: "#D1FF19",
                                  color: "#111",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingSubId(null);
                                  setShowSubIconPicker(false);
                                }}
                                style={{
                                  flex: 1,
                                  padding: "6px 10px",
                                  borderRadius: 6,
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
                          </>
                        ) : (
                          <>
                            <Avatar icon={s.icon} name={s.name} size={28} />
                            <span
                              style={{ flex: 1, fontSize: 13, color: "#333" }}
                            >
                              {s.name}
                            </span>
                            <button
                              onClick={() => handleStartEditSub(s)}
                              title="Edit"
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 6,
                                border: "1px solid #E5E5E0",
                                background: "white",
                                color: "#555",
                                fontSize: 14,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleRemoveSub(s)}
                              title="Delete"
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 6,
                                border: "1px solid #FDEAEA",
                                background: "#FDF8F8",
                                color: "#E05C5C",
                                fontSize: 14,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                    {subs.length === 0 && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "#ccc",
                          fontStyle: "italic",
                        }}
                      >
                        No sub-categories yet
                      </span>
                    )}
                  </div>

                  {/* Add sub-category row */}
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                    className="flex-wrap sm:flex-nowrap"
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <button
                        onClick={() => setShowNewSubIconPicker((p) => !p)}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          border: "1.5px dashed #ccc",
                          background: "white",
                          cursor: "pointer",
                          fontSize: 16,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {newSubIcon ?? (
                          <span style={{ fontSize: 14, color: "#ccc" }}>
                            ＋
                          </span>
                        )}
                      </button>
                      {showNewSubIconPicker && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: 44,
                            left: 0,
                            zIndex: 50,
                          }}
                        >
                          <EmojiPicker
                            onSelect={(e) => {
                              setNewSubIcon(e);
                              setShowNewSubIconPicker(false);
                            }}
                            onClose={() => setShowNewSubIconPicker(false)}
                          />
                        </div>
                      )}
                    </div>
                    <input
                      value={newSub}
                      onChange={(e) => setNewSub(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSub()}
                      placeholder="Add sub-category…"
                      className="flex-1 min-w-0 sm:flex-1"
                      style={{
                        padding: "9px 14px",
                        borderRadius: 8,
                        border: "1.5px dashed #D1FF19",
                        fontSize: 13,
                        color: "#333",
                        outline: "none",
                        background: "#FAFDE8",
                        width: "100%",
                      }}
                    />
                    <button
                      onClick={handleAddSub}
                      className="w-full sm:w-auto"
                      style={{
                        padding: "9px 18px",
                        borderRadius: 8,
                        border: "none",
                        background: "#D1FF19",
                        color: "#111",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Usage chart */}
                <div
                  style={{
                    background: "#F9F9F7",
                    borderRadius: 10,
                    padding: "18px 20px",
                    marginBottom: 24,
                    border: "1px solid #F0F0EA",
                  }}
                >
                  {sectionHead("USAGE THIS MONTH")}
                  <div
                    className="flex-col sm:flex-row sm:items-center"
                    style={{
                      display: "flex",
                      gap: 24,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color:
                            selected.type.name === "income"
                              ? "#2A9D5C"
                              : "#E05C5C",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {stats ? formatRp(stats.currentMonthTotal) : "—"}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}
                      >
                        Total {selected.type.name} ·{" "}
                        {new Date().toLocaleString("en-US", { month: "long" })}
                      </div>
                    </div>
                    <MiniBar stats={stats} />
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{ display: "flex", gap: 12 }}
                  className="flex-col sm:flex-row"
                >
                  <button
                    onClick={handleSave}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 8,
                      border: "none",
                      background: saved ? "#e8ff80" : "#D1FF19",
                      color: "#111",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    {saved ? "Saved ✓" : "Save Changes"}
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{
                      padding: "12px 20px",
                      borderRadius: 8,
                      border: "1px solid #FDEAEA",
                      background: "#FDF8F8",
                      color: "#E05C5C",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
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
              Select a category to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
