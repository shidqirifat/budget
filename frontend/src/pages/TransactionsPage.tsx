import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "@/utils/dayjs";
import MonthNav from "@/components/MonthNav";
import {
  transactionService,
  Transaction,
} from "@/services/transaction.service";
import { categoryService, Category } from "@/services/category.service";
import { formatCurrency } from "@/utils/format";

function parseDateInfo(dateStr: string) {
  const d = dayjs(dateStr);
  return {
    day: d.date(),
    dayName: d.format("dddd"),
    month: d.format("MMMM"),
    year: d.year(),
  };
}

function getMonthRange(month: string): { from: string; to: string } {
  const d = dayjs(month + "-01");
  return {
    from: d.startOf("month").format("YYYY-MM-DD"),
    to: d.endOf("month").format("YYYY-MM-DD"),
  };
}

function txAmount(tx: Transaction): number {
  return tx.type.name === "income" ? tx.amount : -tx.amount;
}

function groupByDate(txs: Transaction[]): [string, Transaction[]][] {
  const groups: Record<string, Transaction[]> = {};
  txs.forEach((tx) => {
    const date = tx.date.slice(0, 10);
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
  });
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Animates max-height from 0 → scrollHeight on open, reverse on close */
function CollapsePanel({
  open,
  children,
  style,
}: {
  open: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      style={{
        overflow: "hidden",
        maxHeight: open ? (ref.current?.scrollHeight ?? 1000) : 0,
        opacity: open ? 1 : 0,
        transition:
          "max-height 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const css = `
  .tx-header {
    padding: 28px 32px 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .tx-header-controls {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: nowrap;
  }
  .tx-search {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    border: 1px solid #E5E5E0;
    border-radius: 8px;
    padding: 9px 14px;
    width: 210px;
  }
  .tx-summary {
    padding: 14px 32px 0;
    flex-shrink: 0;
  }
  .tx-summary-inner {
    background: white;
    border-radius: 12px;
    padding: 18px 32px;
    display: flex;
    align-items: center;
    border: 1px solid #EEEEE8;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .tx-summary-item {
    display: flex;
    align-items: center;
    flex: 1;
  }
  .tx-summary-collapse-btn { display: none; }
  .tx-summary-mobile { display: none !important; }
  .tx-summary-desktop { display: flex !important; }
  .tx-header-title-row { display: contents; }
  .tx-monthnav-desktop { display: flex; }
  .tx-monthnav-mobile  { display: none !important; }
  .tx-filterbar {
    padding: 12px 32px 0;
    flex-shrink: 0;
  }
  .tx-filterbar-inner {
    background: white;
    border: 1px solid #EEEEE8;
    border-radius: 10px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .tx-list {
    flex: 1;
    overflow-y: auto;
    padding: 14px 32px 80px;
  }
  .tx-fab {
    position: fixed;
    bottom: 36px;
    right: 40px;
  }
  .tx-row-amount {
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
    min-width: 140px;
    text-align: right;
    letter-spacing: -0.01em;
  }
  .tx-subcat-desktop { display: block; }
  .tx-subcat-mobile  { display: none !important; }
  @media (max-width: 480px) {
    .tx-subcat-desktop { display: none !important; }
    .tx-subcat-mobile  { display: flex !important; }
    .tx-header-title-row > div:first-child { display: none; }
    .tx-monthnav-mobile { width: 100%; }
    .tx-monthnav-mobile > div { width: 100%; justify-content: space-between; }
  }
  @media (max-width: 768px) {
    .tx-summary-mobile { display: flex !important; }
    .tx-summary-desktop { display: none !important; }
    .tx-header {
      padding: 18px 16px 0;
      flex-direction: column;
      gap: 10px;
    }
    .tx-header-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    .tx-monthnav-desktop { display: none !important; }
    .tx-monthnav-mobile  { display: flex !important; }
    .tx-header-controls {
      width: 100%;
      flex-wrap: wrap;
    }
    .tx-search {
      width: 100%;
      flex: 1;
      min-width: 0;
    }
    .tx-summary {
      padding: 12px 16px 0;
    }
    .tx-summary-inner {
      padding: 14px 16px;
      flex-direction: column;
      gap: 0;
      align-items: stretch;
      cursor: pointer;
      user-select: none;
    }
    .tx-summary-net-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .tx-summary-collapse-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #F2F2EE;
      border: none;
      cursor: pointer;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .tx-summary-collapse-btn:hover { background: #E8E8E4; }
    .tx-summary-collapse-chevron {
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    }
    .tx-summary-sub {
      border-top: 1px solid #F0F0EA;
      margin-top: 12px;
      padding-top: 12px;
      display: flex;
      gap: 0;
    }
    .tx-summary-item {
      flex: none;
    }
    .tx-filterbar {
      padding: 10px 16px 0;
    }
    .tx-filterbar-inner {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }
    .tx-list {
      padding: 12px 16px 80px;
    }
    .tx-fab {
      bottom: 20px;
      right: 20px;
    }
    .tx-row-amount {
      min-width: 0;
      font-size: 13px;
    }
  }
`;

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [month, setMonth] = useState(currentMonthKey);
  const [search, setSearch] = useState("");
  const [filterCatId, setFilterCatId] = useState("");
  const [filterSubId, setFilterSubId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryService
      .getAll()
      .then((r) => setCategories(r.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const { from, to } = getMonthRange(month);
    transactionService
      .getAll({ from, to })
      .then((r) => setTransactions(r.data.data))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [month]);

  const filtered = useMemo(
    () =>
      transactions.filter((tx) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          tx.category.name.toLowerCase().includes(q) ||
          (tx.subCategory?.name || "").toLowerCase().includes(q) ||
          (tx.note || "").toLowerCase().includes(q);
        const matchCat = !filterCatId || tx.categoryId === filterCatId;
        const matchSub = !filterSubId || tx.subCategoryId === filterSubId;
        return matchSearch && matchCat && matchSub;
      }),
    [transactions, search, filterCatId, filterSubId],
  );

  const inflow = filtered.reduce(
    (s, t) => (t.type.name === "income" ? s + t.amount : s),
    0,
  );
  const outflow = filtered.reduce(
    (s, t) => (t.type.name === "expense" ? s + t.amount : s),
    0,
  );
  const net = inflow - outflow;
  const groups = groupByDate(filtered);

  const catOptions = useMemo(() => {
    const ids = new Set(transactions.map((t) => t.categoryId));
    return categories.filter((c) => ids.has(c.id));
  }, [transactions, categories]);

  const subOptions = useMemo(() => {
    if (!filterCatId) return [];
    const ids = new Set(
      transactions
        .filter((t) => t.categoryId === filterCatId && t.subCategoryId)
        .map((t) => t.subCategoryId!),
    );
    const seen = new Set<string>();
    const result: { id: string; name: string }[] = [];
    transactions.forEach((t) => {
      if (
        t.categoryId === filterCatId &&
        t.subCategory &&
        ids.has(t.subCategoryId!) &&
        !seen.has(t.subCategoryId!)
      ) {
        seen.add(t.subCategoryId!);
        result.push({ id: t.subCategoryId!, name: t.subCategory.name });
      }
    });
    return result;
  }, [transactions, filterCatId]);

  const hasFilter = !!filterCatId || !!filterSubId;
  const activeFilterCount = (filterCatId ? 1 : 0) + (filterSubId ? 1 : 0);
  const clearFilters = () => {
    setFilterCatId("");
    setFilterSubId("");
  };

  const filterCatName =
    categories.find((c) => c.id === filterCatId)?.name ?? "";
  const filterSubName =
    subOptions.find((s) => s.id === filterSubId)?.name ?? "";
  const monthLabel = dayjs(month + "-01").format("MMMM YYYY");

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
      <style>{css}</style>

      {/* Header */}
      <div className="tx-header">
        {/* Title row — on mobile this becomes a flex row with MonthNav on the right */}
        <div className="tx-header-title-row">
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
              Transactions
            </h1>
            <p style={{ fontSize: 13, color: "#999", margin: "3px 0 0" }}>
              {monthLabel}
            </p>
          </div>
          <div className="tx-monthnav-mobile">
            <MonthNav month={month} setMonth={setMonth} />
          </div>
        </div>
        <div className="tx-header-controls">
          <div className="tx-monthnav-desktop">
            <MonthNav month={month} setMonth={setMonth} />
          </div>

          {/* Search */}
          <div className="tx-search">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="#bbb" strokeWidth="1.4" />
              <path
                d="M9.5 9.5l2.5 2.5"
                stroke="#bbb"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              style={{
                border: "none",
                outline: "none",
                fontSize: 13,
                color: "#333",
                background: "transparent",
                width: "100%",
              }}
            />
            {search && (
              <span
                onClick={() => setSearch("")}
                style={{ cursor: "pointer", color: "#bbb", fontSize: 14 }}
              >
                ✕
              </span>
            )}
          </div>

          {/* Filter */}
          <button
            onClick={() => setShowFilters((f) => !f)}
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              cursor: "pointer",
              border: hasFilter ? "none" : "1px solid #E5E5E0",
              background: hasFilter ? "#111" : "white",
              color: hasFilter ? "#D1FF19" : "#555",
              fontSize: 13,
              fontWeight: hasFilter ? 700 : 400,
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 3h12M3 7h8M5 11h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Filter
            {activeFilterCount > 0 && (
              <span
                style={{
                  background: "#D1FF19",
                  color: "#111",
                  borderRadius: "50%",
                  width: 16,
                  height: 16,
                  fontSize: 9,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter bar — animated */}
      <CollapsePanel open={showFilters} style={{ flexShrink: 0 }}>
        <div className="tx-filterbar">
          <div className="tx-filterbar-inner">
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#aaa",
                letterSpacing: "0.07em",
                whiteSpace: "nowrap",
              }}
            >
              FILTER BY
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#bbb",
                  letterSpacing: "0.06em",
                }}
              >
                CATEGORY
              </span>
              <select
                value={filterCatId}
                onChange={(e) => {
                  setFilterCatId(e.target.value);
                  setFilterSubId("");
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1.5px solid ${filterCatId ? "#D1FF19" : "#E5E5E0"}`,
                  fontSize: 13,
                  color: filterCatId ? "#111" : "#aaa",
                  outline: "none",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <option value="">All categories</option>
                {catOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#bbb",
                  letterSpacing: "0.06em",
                }}
              >
                SUB-CATEGORY
              </span>
              <select
                value={filterSubId}
                onChange={(e) => setFilterSubId(e.target.value)}
                disabled={!filterCatId}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1.5px solid ${filterSubId ? "#D1FF19" : "#E5E5E0"}`,
                  fontSize: 13,
                  color: filterSubId ? "#111" : "#aaa",
                  outline: "none",
                  background: filterCatId ? "white" : "#F8F8F8",
                  cursor: filterCatId ? "pointer" : "not-allowed",
                  opacity: filterCatId ? 1 : 0.5,
                }}
              >
                <option value="">All sub-categories</option>
                {subOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 2 }}>
              {filterCatId && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 10px",
                    borderRadius: 20,
                    background: "#111",
                    color: "#D1FF19",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {filterCatName}
                  <span
                    onClick={() => {
                      setFilterCatId("");
                      setFilterSubId("");
                    }}
                    style={{ cursor: "pointer", opacity: 0.7 }}
                  >
                    ✕
                  </span>
                </div>
              )}
              {filterSubId && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 10px",
                    borderRadius: 20,
                    background: "#F0F0E8",
                    color: "#555",
                    fontSize: 12,
                  }}
                >
                  {filterSubName}
                  <span
                    onClick={() => setFilterSubId("")}
                    style={{ cursor: "pointer", opacity: 0.7 }}
                  >
                    ✕
                  </span>
                </div>
              )}
              {hasFilter && (
                <button
                  onClick={clearFilters}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    border: "1px solid #E5E5E0",
                    background: "white",
                    color: "#888",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Clear all
                </button>
              )}
            </div>
            <span
              style={{
                fontSize: 12,
                color: "#bbb",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </CollapsePanel>

      {/* Summary bar */}
      <div className="tx-summary">
        {/* Desktop layout */}
        <div
          className="tx-summary-inner tx-summary-desktop"
          style={{ display: "flex" } as React.CSSProperties}
        >
          {[
            { label: "INFLOW", value: inflow, color: "#2A9D5C" },
            { label: "OUTFLOW", value: outflow, color: "#E05C5C" },
            { label: "NET", value: net, color: net >= 0 ? "#111" : "#E05C5C" },
          ].map((item, i) => (
            <div key={i} className="tx-summary-item">
              <div
                style={{
                  flex: 1,
                  textAlign: i === 0 ? "left" : i === 2 ? "right" : "center",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#bbb",
                    letterSpacing: "0.08em",
                    marginBottom: 5,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: item.color,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {i === 1 ? "-" : ""}
                  {formatCurrency(item.value)}
                </div>
              </div>
              {i < 2 && (
                <div
                  style={{
                    width: 1,
                    height: 40,
                    background: "#F0F0EA",
                    margin: "0 32px",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Mobile layout — NET always visible, INFLOW/OUTFLOW collapsible */}
        <div
          className="tx-summary-inner tx-summary-mobile"
          onClick={() => setSummaryExpanded((e) => !e)}
        >
          <div className="tx-summary-net-row">
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#bbb",
                  letterSpacing: "0.08em",
                  marginBottom: 4,
                }}
              >
                NET
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: net >= 0 ? "#111" : "#E05C5C",
                  letterSpacing: "-0.02em",
                }}
              >
                {formatCurrency(net)}
              </div>
            </div>
            <button
              className="tx-summary-collapse-btn"
              onClick={(e) => {
                e.stopPropagation();
                setSummaryExpanded((v) => !v);
              }}
              aria-label="Toggle inflow and outflow"
            >
              <svg
                className="tx-summary-collapse-chevron"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{
                  transform: summaryExpanded
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              >
                <path
                  d="M2 4l4 4 4-4"
                  stroke="#888"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <CollapsePanel open={summaryExpanded}>
            <div className="tx-summary-sub">
              {[
                { label: "INFLOW", value: inflow, color: "#2A9D5C", sign: "" },
                {
                  label: "OUTFLOW",
                  value: outflow,
                  color: "#E05C5C",
                  sign: "-",
                },
              ].map((item, i) => (
                <div key={i} className="tx-summary-item" style={{ flex: 1 }}>
                  <div
                    style={{ flex: 1, textAlign: i === 0 ? "left" : "right" }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#bbb",
                        letterSpacing: "0.08em",
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: item.color,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {item.sign}
                      {formatCurrency(item.value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsePanel>
        </div>
      </div>

      {/* Transaction groups */}
      <div className="tx-list">
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#bbb",
              fontSize: 14,
            }}
          >
            Loading…
          </div>
        )}
        {!loading && groups.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#bbb",
              fontSize: 14,
            }}
          >
            No transactions found.
          </div>
        )}
        {!loading &&
          groups.map(([date, txs]) => {
            const { day, dayName, month: mName, year } = parseDateInfo(date);
            const dayTotal = txs.reduce((s, t) => s + txAmount(t), 0);
            return (
              <div
                key={date}
                style={{
                  marginBottom: 12,
                  borderRadius: 10,
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    background: "#EEEEE8",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 10 }}
                  >
                    <span
                      style={{
                        fontSize: 26,
                        fontWeight: 700,
                        color: "#111",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {String(day).padStart(2, "0")}
                    </span>
                    <div>
                      <div
                        style={{ fontSize: 12, fontWeight: 600, color: "#555" }}
                      >
                        {dayName}
                      </div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>
                        {mName} {year}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: dayTotal < 0 ? "#E05C5C" : "#2A9D5C",
                    }}
                  >
                    {dayTotal < 0 ? "-" : "+"}
                    {formatCurrency(Math.abs(dayTotal))}
                  </span>
                </div>
                {txs.map((tx, i) => {
                  const isLast = i === txs.length - 1;
                  const signed = txAmount(tx);
                  return (
                    <div
                      key={tx.id}
                      onClick={() =>
                        navigate("/add-transaction", {
                          state: { editingTx: tx },
                        })
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "13px 16px",
                        background: i % 2 === 0 ? "white" : "#FAFAF7",
                        borderBottom: isLast ? "none" : "1px solid #F2F2EE",
                        cursor: "pointer",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "#F5FFF0")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          i % 2 === 0 ? "white" : "#FAFAF7")
                      }
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "#F0F0EE",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#888",
                          flexShrink: 0,
                        }}
                      >
                        {tx.category.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#111",
                          }}
                        >
                          {tx.category.name}
                        </div>
                        {(tx.subCategory || tx.event) && (
                          <div
                            className="tx-subcat-mobile mt-0.5 mb-1"
                            style={{
                              display: "flex",
                              gap: 4,
                              flexWrap: "wrap",
                              marginTop: 2,
                              marginBottom: 2,
                            }}
                          >
                            {tx.subCategory && (
                              <span
                                className="mr-1"
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: 20,
                                  background: "#F2F2EE",
                                  fontSize: 11,
                                  color: "#888",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 120,
                                }}
                              >
                                {tx.subCategory.name}
                              </span>
                            )}
                            {tx.event && (
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: 20,
                                  background: "#EEF4FF",
                                  fontSize: 11,
                                  color: "#5C8AE0",
                                  fontWeight: 600,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 120,
                                }}
                              >
                                {tx.event.name}
                              </span>
                            )}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: 12,
                            color: "#999",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tx.note || "—"}
                        </div>
                      </div>
                      {(tx.subCategory || tx.event) && (
                        <div
                          className="tx-subcat-desktop"
                          style={{ display: "flex", gap: 6, flexShrink: 0 }}
                        >
                          {tx.subCategory && (
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: 20,
                                background: "#F2F2EE",
                                fontSize: 11,
                                color: "#888",
                                maxWidth: 100,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {tx.subCategory.name}
                            </span>
                          )}
                          {tx.event && (
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: 20,
                                background: "#EEF4FF",
                                fontSize: 11,
                                color: "#5C8AE0",
                                fontWeight: 600,
                                maxWidth: 120,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {tx.event.name}
                            </span>
                          )}
                        </div>
                      )}
                      <div
                        className="tx-row-amount"
                        style={{ color: signed < 0 ? "#E05C5C" : "#2A9D5C" }}
                      >
                        {signed < 0 ? "-" : "+"}
                        {formatCurrency(Math.abs(signed))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate("/add-transaction")}
        className="tx-fab"
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#D1FF19",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          transition: "transform 0.15s, box-shadow 0.15s",
          zIndex: 200,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.08)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 6px 28px rgba(0,0,0,0.22)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 4px 20px rgba(0,0,0,0.18)";
        }}
        title="Add transaction"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="#111"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
