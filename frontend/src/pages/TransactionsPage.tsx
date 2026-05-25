import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MonthNav from "@/components/MonthNav";
import { formatCurrency } from "@/utils/format";
import { useTransactionList } from "@/hooks/useTransactionList";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionFilter from "@/components/transactions/TransactionFilter";
import { Transaction } from "@/services/transaction.service";
import IconSearch from "@/assets/icons/IconSearch";
import IconFilter from "@/assets/icons/IconFilter";
import IconChevronDown from "@/assets/icons/IconChevronDown";
import IconPlus from "@/assets/icons/IconPlus";

function CollapsePanel({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
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
      }}
    >
      {children}
    </div>
  );
}

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const {
    month,
    setMonth,
    monthLabel,
    loading,
    groups,
    inflow,
    outflow,
    net,
    filteredCount,
    categories,
    filter,
    filterActions,
    filterOptions,
  } = useTransactionList();

  function handleTransactionClick(tx: Transaction) {
    navigate("/add-transaction", { state: { editingTx: tx } });
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Header */}
      <div
        className="
        px-8 pt-7 pb-0 flex items-start justify-between shrink-0
        max-md:px-4 max-md:pt-[18px] max-md:flex-col max-md:gap-2.5
      "
      >
        {/* Title row */}
        <div className="contents max-md:flex max-md:items-center max-md:justify-between max-md:w-full">
          <div className="max-sm:hidden">
            <h1 className="text-[22px] font-bold text-text-primary m-0 tracking-tight">
              Transactions
            </h1>
            <p className="text-[13px] text-text-secondary mt-[3px] mb-0">
              {monthLabel}
            </p>
          </div>
          {/* MonthNav — mobile */}
          <div className="hidden max-md:flex">
            <MonthNav month={month} setMonth={setMonth} />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex gap-2.5 items-center flex-nowrap max-md:w-full max-md:flex-wrap">
          {/* MonthNav — desktop */}
          <div className="flex max-md:hidden">
            <MonthNav month={month} setMonth={setMonth} />
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-bg-white border border-border-input rounded-lg px-3.5 py-[9px] w-[210px] max-md:w-full max-md:flex-1 max-md:min-w-0">
            <IconSearch className="shrink-0" />
            <input
              value={filter.search}
              onChange={(e) => filterActions.setSearch(e.target.value)}
              placeholder="Search…"
              className="border-none outline-none text-[13px] text-text-primary bg-transparent w-full"
            />
            {filter.search && (
              <button
                type="button"
                onClick={() => filterActions.setSearch("")}
                className="cursor-pointer text-text-muted text-sm bg-transparent border-none p-0"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((f) => !f)}
            className={`flex items-center gap-1.5 px-3.5 py-[9px] rounded-lg text-[13px] cursor-pointer shrink-0 transition-colors
              ${
                filterOptions.hasFilter
                  ? "bg-text-primary text-bg-lime border-none font-bold"
                  : "bg-bg-white border border-border-input text-text-secondary font-normal"
              }`}
          >
            <IconFilter />
            Filter
            {filterOptions.activeFilterCount > 0 && (
              <span className="bg-bg-lime text-text-primary rounded-full w-4 h-4 text-[9px] font-extrabold flex items-center justify-center">
                {filterOptions.activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter bar — animated collapse */}
      <CollapsePanel open={showFilters}>
        <div className="px-8 pt-3 pb-0 shrink-0 max-md:px-4 max-md:pt-2.5">
          <TransactionFilter
            filter={filter}
            actions={filterActions}
            options={filterOptions}
            categories={categories}
            resultCount={filteredCount}
          />
        </div>
      </CollapsePanel>

      {/* Summary bar */}
      <div className="px-8 pt-3.5 pb-0 shrink-0 max-md:px-4 max-md:pt-3">
        {/* Desktop */}
        <div className="hidden md:flex bg-bg-white rounded-xl px-8 py-[18px] items-center border border-border-default shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          {[
            {
              label: "INFLOW",
              value: inflow,
              colorClass: "text-text-income",
              sign: "",
            },
            {
              label: "OUTFLOW",
              value: outflow,
              colorClass: "text-text-expense",
              sign: "-",
            },
            {
              label: "NET",
              value: net,
              colorClass: net >= 0 ? "text-text-primary" : "text-text-expense",
              sign: "",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center flex-1">
              <div
                className={`flex-1 ${i === 0 ? "text-left" : i === 2 ? "text-right" : "text-center"}`}
              >
                <div className="text-[10px] font-semibold text-text-muted tracking-[0.08em] mb-[5px]">
                  {item.label}
                </div>
                <div
                  className={`text-xl font-bold tracking-tight ${item.colorClass}`}
                >
                  {item.sign}
                  {formatCurrency(item.value)}
                </div>
              </div>
              {i < 2 && <div className="w-px h-10 bg-[#F0F0EA] mx-8" />}
            </div>
          ))}
        </div>

        {/* Mobile — NET always visible, INFLOW/OUTFLOW collapsible */}
        <div
          className="md:hidden bg-bg-white rounded-xl px-4 py-[14px] border border-border-default shadow-[0_1px_4px_rgba(0,0,0,0.05)] cursor-pointer select-none"
          onClick={() => setSummaryExpanded((e) => !e)}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-text-muted tracking-[0.08em] mb-1">
                NET
              </div>
              <div
                className={`text-xl font-bold tracking-tight ${net >= 0 ? "text-text-primary" : "text-text-expense"}`}
              >
                {formatCurrency(net)}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSummaryExpanded((v) => !v);
              }}
              aria-label="Toggle inflow and outflow"
              className="flex items-center justify-center w-6 h-6 rounded-full bg-border-default border-none cursor-pointer"
            >
              <IconChevronDown
                size={12}
                style={{
                  transform: summaryExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </button>
          </div>

          <CollapsePanel open={summaryExpanded}>
            <div className="flex border-t border-[#F0F0EA] mt-3 pt-3">
              {[
                {
                  label: "INFLOW",
                  value: inflow,
                  colorClass: "text-text-income",
                  sign: "",
                },
                {
                  label: "OUTFLOW",
                  value: outflow,
                  colorClass: "text-text-expense",
                  sign: "-",
                },
              ].map((item, i) => (
                <div key={i} className="flex-1">
                  <div className={i === 0 ? "text-left" : "text-right"}>
                    <div className="text-[10px] font-semibold text-text-muted tracking-[0.08em] mb-1">
                      {item.label}
                    </div>
                    <div
                      className={`text-base font-bold tracking-tight ${item.colorClass}`}
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

      {/* Transaction list */}
      <div className="flex-1 overflow-y-auto px-8 pt-3.5 pb-20 max-md:px-4 max-md:pt-3">
        <TransactionList
          groups={groups}
          loading={loading}
          onTransactionClick={handleTransactionClick}
        />
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={() => navigate("/add-transaction")}
        title="Add transaction"
        className="fixed bottom-9 right-10 w-14 h-14 rounded-full bg-bg-lime border-none cursor-pointer flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-transform hover:scale-105 hover:shadow-[0_6px_28px_rgba(0,0,0,0.22)] z-[200] max-md:bottom-5 max-md:right-5"
      >
        <IconPlus />
      </button>
    </div>
  );
}
