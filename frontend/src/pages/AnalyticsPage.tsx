import { useState, useEffect } from "react";
import dayjs from "@/utils/dayjs";
import MonthNav from "@/components/MonthNav";
import { formatRp } from "@/utils/designData";
import {
  transactionService,
  AnalyticsData,
  AnalyticsMonthly,
} from "@/services/transaction.service";

const CATEGORY_COLORS = [
  "#E05C5C",
  "#2A9D5C",
  "#E8A040",
  "#5C8AE0",
  "#40C4BE",
  "#A05CE0",
  "#E05CA0",
  "#E8A05C",
  "#5CE0D8",
  "#9D5C2A",
];

function monthShort(m: string) {
  return dayjs(m + "-01").format("MMM");
}
function monthLabel(m: string) {
  return dayjs(m + "-01").format("MMMM YYYY");
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "categories">(
    "overview",
  );
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    transactionService
      .getAnalytics(month)
      .then((res) => setData(res.data.data))
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [month]);

  const cur = data?.monthly.find((m) => m.month === month);
  const curIdx = data?.monthly.findIndex((m) => m.month === month) ?? -1;
  const prev: AnalyticsMonthly | undefined =
    curIdx > 0 ? data?.monthly[curIdx - 1] : undefined;

  const inflow = cur?.inflow ?? 0;
  const outflow = cur?.outflow ?? 0;
  const net = inflow - outflow;
  const savingsRate = inflow > 0 ? Math.round((net / inflow) * 100) : 0;

  const diffInflow = prev ? inflow - prev.inflow : 0;
  const diffOutflow = prev ? outflow - prev.outflow : 0;
  const pctInflow =
    prev && prev.inflow > 0
      ? Math.round((Math.abs(diffInflow) / prev.inflow) * 100)
      : 0;
  const pctOutflow =
    prev && prev.outflow > 0
      ? Math.round((Math.abs(diffOutflow) / prev.outflow) * 100)
      : 0;

  const cats = (data?.categoryBreakdown ?? []).map((c, i) => ({
    ...c,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));
  const totalOut = cats.reduce((s, c) => s + c.amount, 0);

  const Stat = ({
    label,
    value,
    sub,
    color,
  }: {
    label: string;
    value: string;
    sub?: string;
    color?: string;
  }) => (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        padding: "18px 22px",
        border: "1px solid #EEEEE8",
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "#bbb",
          letterSpacing: "0.07em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: color || "#111",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );

  const BarChart = () => {
    if (!data) return null;
    const months = data.monthly;
    const maxVal = Math.max(
      ...months.map((m) => Math.max(m.inflow, m.outflow)),
      1,
    );
    const BAR_H = 220,
      BAR_W = 28,
      GAP = 14;
    const GROUP = BAR_W * 2 + GAP;
    const TOTAL = months.length * (GROUP + 20);
    return (
      <svg
        width={TOTAL + 40}
        height={BAR_H + 48}
        style={{ overflow: "visible", display: "block" }}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <g key={i}>
            <line
              x1={0}
              y1={BAR_H - v * BAR_H}
              x2={TOTAL + 20}
              y2={BAR_H - v * BAR_H}
              stroke="#F0F0EA"
              strokeWidth="1"
              strokeDasharray={v === 0 ? "none" : "4,4"}
            />
            <text
              x={-8}
              y={BAR_H - v * BAR_H + 4}
              textAnchor="end"
              fontSize={9}
              fill="#ccc"
              fontFamily="'Space Grotesk',sans-serif"
            >
              {v === 0 ? "0" : `${((v * maxVal) / 1000000).toFixed(1)}jt`}
            </text>
          </g>
        ))}
        {months.map((m, i) => {
          const isCur = m.month === month;
          const x = i * (GROUP + 20) + 10;
          const inH = Math.round((m.inflow / maxVal) * BAR_H);
          const outH = Math.round((m.outflow / maxVal) * BAR_H);
          return (
            <g key={i}>
              {isCur && (
                <rect
                  x={x - 4}
                  y={-8}
                  width={GROUP + 8}
                  height={BAR_H + 8}
                  rx={6}
                  fill="#F5FFF0"
                  stroke="#D1FF19"
                  strokeWidth="1.5"
                  style={{ opacity: 0.4 }}
                />
              )}
              <rect
                x={x}
                y={BAR_H - inH}
                width={BAR_W}
                height={inH}
                rx={4}
                fill={isCur ? "#2A9D5C" : "#DCEEE5"}
              />
              <rect
                x={x + BAR_W + GAP}
                y={BAR_H - outH}
                width={BAR_W}
                height={outH}
                rx={4}
                fill={isCur ? "#D1FF19" : "#EAEAE4"}
              />
              <text
                x={x + GROUP / 2}
                y={BAR_H + 18}
                textAnchor="middle"
                fontSize={11}
                fontWeight={isCur ? 700 : 400}
                fill={isCur ? "#111" : "#bbb"}
                fontFamily="'Space Grotesk',sans-serif"
              >
                {monthShort(m.month)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const DonutChart = ({ items, total }: { items: { color: string; amount: number }[]; total: number }) => {
    if (!items.length) return null;
    const SIZE = 140,
      CX = 70,
      CY = 70,
      R = 56,
      IR = 36;
    let angle = -Math.PI / 2;
    const slices = items.map((c) => {
      const pct = total > 0 ? c.amount / total : 0;
      const sa = angle,
        ea = angle + pct * Math.PI * 2;
      const x1 = CX + R * Math.cos(sa),
        y1 = CY + R * Math.sin(sa);
      const x2 = CX + R * Math.cos(ea),
        y2 = CY + R * Math.sin(ea);
      angle = ea;
      return { ...c, pct, x1, y1, x2, y2, lrg: pct > 0.5 ? 1 : 0 };
    });
    const isSingle = slices.length === 1;
    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {isSingle ? (
          <circle cx={CX} cy={CY} r={R} fill={slices[0].color} />
        ) : (
          slices.map((s, i) => (
            <path
              key={i}
              d={`M${CX},${CY} L${s.x1},${s.y1} A${R},${R} 0 ${s.lrg},1 ${s.x2},${s.y2} Z`}
              fill={s.color}
            />
          ))
        )}
        <circle cx={CX} cy={CY} r={IR} fill="white" />
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill="#111"
          fontFamily="'Space Grotesk',sans-serif"
        >
          Total
        </text>
        <text
          x={CX}
          y={CY + 10}
          textAnchor="middle"
          fontSize={9}
          fill="#888"
          fontFamily="'Space Grotesk',sans-serif"
        >
          {monthShort(month)}
        </text>
      </svg>
    );
  };

  const chartFirst = data?.monthly[0];
  const chartLast = cur;

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
      <div
        style={{
          padding: "28px 32px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
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
            Analytics
          </h1>
          <p style={{ fontSize: 13, color: "#999", margin: "3px 0 0" }}>
            {monthLabel(month)}
            {prev ? ` · vs ${monthShort(prev.month)}` : ""}
          </p>
        </div>
        <MonthNav month={month} setMonth={setMonth} />
      </div>

      <div
        style={{
          display: "flex",
          padding: "18px 32px 0",
          gap: 6,
          flexShrink: 0,
        }}
      >
        {(
          [
            ["overview", "Overview"],
            ["categories", "By Category"],
          ] as const
        ).map(([id, lbl]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              cursor: "pointer",
              background: activeTab === id ? "#111" : "white",
              color: activeTab === id ? "#D1FF19" : "#888",
              fontSize: 13,
              fontWeight: activeTab === id ? 700 : 400,
              border: activeTab !== id ? "1px solid #EEEEE8" : "none",
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 32px 40px" }}>
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
              color: "#bbb",
              fontSize: 14,
            }}
          >
            Loading...
          </div>
        )}

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 200,
              color: "#E05C5C",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && activeTab === "overview" && (
          <>
            <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
              <Stat
                label="INFLOW"
                value={formatRp(inflow)}
                sub={
                  prev
                    ? `${diffInflow >= 0 ? "+" : "-"}${pctInflow}% vs ${monthShort(prev.month)}`
                    : "No prev month"
                }
                color="#2A9D5C"
              />
              <Stat
                label="OUTFLOW"
                value={formatRp(-outflow)}
                sub={
                  prev
                    ? `${diffOutflow >= 0 ? "+" : "-"}${pctOutflow}% vs ${monthShort(prev.month)}`
                    : "No prev month"
                }
                color="#E05C5C"
              />
              <Stat
                label="NET"
                value={formatRp(net)}
                sub={net >= 0 ? "Positive cash flow ✓" : "Negative cash flow ✗"}
                color={net >= 0 ? "#111" : "#E05C5C"}
              />
              <Stat
                label="SAVINGS RATE"
                value={`${savingsRate}%`}
                sub={savingsRate >= 30 ? "Target: 30% ✓" : "Below 30% target"}
                color="#D1FF19"
              />
            </div>

            <div
              style={{
                background: "white",
                borderRadius: 12,
                padding: "22px 28px",
                border: "1px solid #EEEEE8",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>
                    Monthly Cash Flow
                  </div>
                  <div style={{ fontSize: 12, color: "#bbb", marginTop: 3 }}>
                    {chartFirst
                      ? `${monthLabel(chartFirst.month)} – ${chartLast ? monthLabel(chartLast.month) : ""}`
                      : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  {[
                    ["#2A9D5C", "Inflow"],
                    ["#D1FF19", "Outflow"],
                  ].map(([col, lbl]) => (
                    <div
                      key={lbl}
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: col,
                        }}
                      />
                      <span style={{ fontSize: 12, color: "#888" }}>{lbl}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{ display: "flex", gap: 28, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    overflowX: "auto",
                    flex: "0 0 50%",
                    minWidth: 0,
                  }}
                >
                  <BarChart />
                </div>

                {data?.insights &&
                  (() => {
                    const ins = data.insights;
                    const rows: {
                      icon: string;
                      label: string;
                      value: string;
                      sub?: string;
                      accent?: string;
                    }[] = [];

                    if (ins.mostExpenseCategory)
                      rows.push({
                        icon: "💸",
                        label: "Most expense",
                        value: ins.mostExpenseCategory.name,
                        sub: formatRp(-ins.mostExpenseCategory.amount),
                        accent: "#E05C5C",
                      });
                    if (ins.mostFrequentExpense)
                      rows.push({
                        icon: "🔁",
                        label: "Most frequent",
                        value: ins.mostFrequentExpense.name,
                        sub: `${ins.mostFrequentExpense.count} tx`,
                        accent: "#E8A040",
                      });
                    if (ins.mostIncomeCategory)
                      rows.push({
                        icon: "💰",
                        label: "Top income",
                        value: ins.mostIncomeCategory.name,
                        sub: formatRp(ins.mostIncomeCategory.amount),
                        accent: "#2A9D5C",
                      });

                    const expDiffs = ins.expenseDiff;
                    const incDiffs = ins.incomeDiff;
                    const hasDiffs = expDiffs.length > 0 || incDiffs.length > 0;

                    if (!rows.length && !hasDiffs) return null;

                    return (
                      <div
                        style={{
                          flex: "0 0 47%",
                          minWidth: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div className="grid grid-cols-3 gap-2">
                          {rows.map((r, i) => (
                            <div
                              key={i}
                              style={{
                                padding: "10px 14px",
                                background: "#FAFAFA",
                                borderRadius: 10,
                                border: "1px solid #EEEEE8",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "#ccc",
                                  fontWeight: 600,
                                  letterSpacing: "0.07em",
                                  marginBottom: 4,
                                }}
                              >
                                {r.icon} {r.label.toUpperCase()}
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: r.accent || "#111",
                                }}
                              >
                                {r.value}
                              </div>
                              {r.sub && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#aaa",
                                    marginTop: 2,
                                  }}
                                >
                                  {r.sub}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {hasDiffs && prev && (
                          <div
                            style={{
                              padding: "10px 14px",
                              background: "#FAFAFA",
                              borderRadius: 10,
                              border: "1px solid #EEEEE8",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                color: "#ccc",
                                fontWeight: 600,
                                letterSpacing: "0.07em",
                                marginBottom: 8,
                              }}
                            >
                              VS {monthShort(prev.month).toUpperCase()}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 7,
                              }}
                            >
                              {expDiffs.map((d, i) => (
                                <div key={i}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 5,
                                      marginBottom: 1,
                                    }}
                                  >
                                    <span style={{ fontSize: 11 }}>
                                      {d.diff > 0 ? "📈" : "📉"}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: "#333",
                                        flex: 1,
                                      }}
                                    >
                                      {d.name}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color:
                                          d.diff > 0 ? "#E05C5C" : "#2A9D5C",
                                      }}
                                    >
                                      {d.diff > 0 ? "+" : ""}
                                      {formatRp(d.diff)}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "#ccc",
                                      paddingLeft: 16,
                                    }}
                                  >
                                    {formatRp(-d.prev)} → {formatRp(-d.current)}
                                  </div>
                                </div>
                              ))}
                              {incDiffs.map((d, i) => (
                                <div key={`inc-${i}`}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 5,
                                      marginBottom: 1,
                                    }}
                                  >
                                    <span style={{ fontSize: 11 }}>
                                      {d.diff > 0 ? "📈" : "📉"}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: "#333",
                                        flex: 1,
                                      }}
                                    >
                                      {d.name}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color:
                                          d.diff > 0 ? "#2A9D5C" : "#E05C5C",
                                      }}
                                    >
                                      {d.diff > 0 ? "+" : ""}
                                      {formatRp(d.diff)}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "#ccc",
                                      paddingLeft: 16,
                                    }}
                                  >
                                    {formatRp(d.prev)} → {formatRp(d.current)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>
            </div>

            <div style={{ display: "flex", gap: 14 }}>
              {cats.length > 0 && (
                <div style={{ background: "white", borderRadius: 12, padding: "22px 28px", border: "1px solid #EEEEE8", flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 16 }}>
                    Expense Categories · {monthShort(month)}
                  </div>
                  <div style={{ display: "flex", padding: "0 0 10px", borderBottom: "1px solid #F2F2EE", marginBottom: 8 }}>
                    {["Category", ...(prev ? [monthShort(prev.month)] : []), monthShort(month), "% of Total", ...(prev ? ["% Diff"] : [])].map((h, i) => (
                      <div key={h} style={{ flex: i === 0 ? 2 : 1, fontSize: 10, fontWeight: 600, color: "#bbb", letterSpacing: "0.07em", textAlign: i === 0 ? "left" : "right" }}>
                        {h}
                      </div>
                    ))}
                  </div>
                  {cats.map((row, i) => {
                    const pctDiff = row.prevAmount > 0 ? Math.round(((row.amount - row.prevAmount) / row.prevAmount) * 100) : null;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: i < cats.length - 1 ? "1px solid #F8F8F4" : "none" }}>
                        <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: row.color, flexShrink: 0 }}/>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>{row.name}</span>
                        </div>
                        {prev && (
                          <div style={{ flex: 1, textAlign: "right", fontSize: 12, color: "#bbb" }}>
                            {row.prevAmount > 0 ? formatRp(-row.prevAmount) : "—"}
                          </div>
                        )}
                        <div style={{ flex: 1, textAlign: "right", fontSize: 13, fontWeight: 600, color: "#E05C5C" }}>
                          {formatRp(-row.amount)}
                        </div>
                        <div style={{ flex: 1, textAlign: "right", fontSize: 12, color: "#888" }}>
                          {totalOut > 0 ? Math.round((row.amount / totalOut) * 100) : 0}%
                        </div>
                        {prev && (
                          <div style={{ flex: 1, textAlign: "right", fontSize: 12, fontWeight: 600, color: pctDiff == null ? "#bbb" : pctDiff > 0 ? "#E05C5C" : "#2A9D5C" }}>
                            {pctDiff == null ? "new" : `${pctDiff > 0 ? "+" : ""}${pctDiff}%`}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {(data?.incomeBreakdown ?? []).length > 0 && (() => {
                const incCats = data!.incomeBreakdown.map((c, i) => ({ ...c, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));
                const totalIn = incCats.reduce((s, c) => s + c.amount, 0);
                return (
                  <div style={{ background: "white", borderRadius: 12, padding: "22px 28px", border: "1px solid #EEEEE8", flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 16 }}>
                      Income Categories · {monthShort(month)}
                    </div>
                    <div style={{ display: "flex", padding: "0 0 10px", borderBottom: "1px solid #F2F2EE", marginBottom: 8 }}>
                      {["Category", ...(prev ? [monthShort(prev.month)] : []), monthShort(month), "% of Total", ...(prev ? ["% Diff"] : [])].map((h, i) => (
                        <div key={h} style={{ flex: i === 0 ? 2 : 1, fontSize: 10, fontWeight: 600, color: "#bbb", letterSpacing: "0.07em", textAlign: i === 0 ? "left" : "right" }}>
                          {h}
                        </div>
                      ))}
                    </div>
                    {incCats.map((row, i) => {
                      const pctDiff = row.prevAmount > 0 ? Math.round(((row.amount - row.prevAmount) / row.prevAmount) * 100) : null;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: i < incCats.length - 1 ? "1px solid #F8F8F4" : "none" }}>
                          <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: row.color, flexShrink: 0 }}/>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>{row.name}</span>
                          </div>
                          {prev && (
                            <div style={{ flex: 1, textAlign: "right", fontSize: 12, color: "#bbb" }}>
                              {row.prevAmount > 0 ? formatRp(row.prevAmount) : "—"}
                            </div>
                          )}
                          <div style={{ flex: 1, textAlign: "right", fontSize: 13, fontWeight: 600, color: "#2A9D5C" }}>
                            {formatRp(row.amount)}
                          </div>
                          <div style={{ flex: 1, textAlign: "right", fontSize: 12, color: "#888" }}>
                            {totalIn > 0 ? Math.round((row.amount / totalIn) * 100) : 0}%
                          </div>
                          {prev && (
                            <div style={{ flex: 1, textAlign: "right", fontSize: 12, fontWeight: 600, color: pctDiff == null ? "#bbb" : pctDiff > 0 ? "#2A9D5C" : "#E05C5C" }}>
                              {pctDiff == null ? "new" : `${pctDiff > 0 ? "+" : ""}${pctDiff}%`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </>
        )}

        {!loading && !error && activeTab === "categories" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", gap: 20 }}>
            <div
              style={{
                background: "white",
                borderRadius: 12,
                padding: "22px 28px",
                border: "1px solid #EEEEE8",
                width: 300,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#111",
                  marginBottom: 4,
                }}
              >
                Outflow by Category
              </div>
              <div style={{ fontSize: 12, color: "#bbb", marginBottom: 20 }}>
                {monthLabel(month)} · Total {formatRp(-totalOut)}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <DonutChart items={cats} total={totalOut} />
              </div>
              {cats.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: c.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 13, color: "#333", flex: 1 }}>
                    {c.name}
                  </span>
                  <span
                    style={{ fontSize: 12, fontWeight: 600, color: "#888" }}
                  >
                    {totalOut > 0 ? Math.round((c.amount / totalOut) * 100) : 0}
                    %
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#E05C5C",
                      minWidth: 90,
                      textAlign: "right",
                    }}
                  >
                    {formatRp(-c.amount)}
                  </span>
                </div>
              ))}
              {cats.length === 0 && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#bbb",
                    textAlign: "center",
                    marginTop: 20,
                  }}
                >
                  No expenses this month
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              {cats.map((cat, ci) => {
                const pct =
                  totalOut > 0 ? Math.round((cat.amount / totalOut) * 100) : 0;
                return (
                  <div
                    key={ci}
                    style={{
                      background: "white",
                      borderRadius: 12,
                      padding: "18px 22px",
                      border: "1px solid #EEEEE8",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: cat.color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#111",
                          flex: 1,
                        }}
                      >
                        {cat.name}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#E05C5C",
                        }}
                      >
                        {formatRp(-cat.amount)}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 10,
                          background: "#F5F5F2",
                          color: "#888",
                        }}
                      >
                        {pct}% of total
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: "#F2F2EE",
                        overflow: "hidden",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: cat.color,
                          borderRadius: 3,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                    {cat.subs.map((s, si) => (
                      <div
                        key={si}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "5px 0",
                        }}
                      >
                        <div
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: "#ddd",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: 12, color: "#888", flex: 1 }}>
                          {s.name}
                        </span>
                        <span style={{ fontSize: 11, color: "#bbb" }}>
                          {cat.amount > 0
                            ? Math.round((s.amount / cat.amount) * 100)
                            : 0}
                          %
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#aaa",
                            minWidth: 70,
                            textAlign: "right",
                          }}
                        >
                          {formatRp(-s.amount)}
                        </span>
                      </div>
                    ))}
                    {cat.subs.length === 0 && (
                      <div
                        style={{ fontSize: 12, color: "#ddd", paddingTop: 4 }}
                      >
                        No subcategory breakdown
                      </div>
                    )}
                  </div>
                );
              })}
              {cats.length === 0 && (
                <div
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: "40px",
                    border: "1px solid #EEEEE8",
                    textAlign: "center",
                    color: "#bbb",
                    fontSize: 14,
                  }}
                >
                  No expenses recorded for {monthLabel(month)}
                </div>
              )}
            </div>
          </div>

          {/* Inflow by category */}
          {(data?.incomeBreakdown ?? []).length > 0 && (() => {
            const incCats = data!.incomeBreakdown.map((c, i) => ({ ...c, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));
            const totalIn = incCats.reduce((s, c) => s + c.amount, 0);
            return (
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ background: "white", borderRadius: 12, padding: "22px 28px", border: "1px solid #EEEEE8", width: 300, flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>Inflow by Category</div>
                  <div style={{ fontSize: 12, color: "#bbb", marginBottom: 20 }}>
                    {monthLabel(month)} · Total {formatRp(totalIn)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                    <DonutChart items={incCats} total={totalIn} />
                  </div>
                  {incCats.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, flexShrink: 0 }}/>
                      <span style={{ fontSize: 13, color: "#333", flex: 1 }}>{c.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>
                        {totalIn > 0 ? Math.round((c.amount / totalIn) * 100) : 0}%
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#2A9D5C", minWidth: 90, textAlign: "right" }}>
                        {formatRp(c.amount)}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  {incCats.map((cat, ci) => {
                    const pct = totalIn > 0 ? Math.round((cat.amount / totalIn) * 100) : 0;
                    return (
                      <div key={ci} style={{ background: "white", borderRadius: 12, padding: "18px 22px", border: "1px solid #EEEEE8", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                          <div style={{ width: 12, height: 12, borderRadius: "50%", background: cat.color, flexShrink: 0 }}/>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#111", flex: 1 }}>{cat.name}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#2A9D5C" }}>{formatRp(cat.amount)}</span>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "#F5F5F2", color: "#888" }}>
                            {pct}% of total
                          </span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: "#F2F2EE", overflow: "hidden", marginBottom: 10 }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: cat.color, borderRadius: 3, transition: "width 0.4s ease" }}/>
                        </div>
                        {cat.subs.map((s, si) => (
                          <div key={si} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#ddd", flexShrink: 0 }}/>
                            <span style={{ fontSize: 12, color: "#888", flex: 1 }}>{s.name}</span>
                            <span style={{ fontSize: 11, color: "#bbb" }}>
                              {cat.amount > 0 ? Math.round((s.amount / cat.amount) * 100) : 0}%
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: "#aaa", minWidth: 70, textAlign: "right" }}>
                              {formatRp(s.amount)}
                            </span>
                          </div>
                        ))}
                        {cat.subs.length === 0 && (
                          <div style={{ fontSize: 12, color: "#ddd", paddingTop: 4 }}>No subcategory breakdown</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          </div>
        )}
      </div>
    </div>
  );
}
