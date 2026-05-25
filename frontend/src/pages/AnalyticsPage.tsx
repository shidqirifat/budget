import MonthNav from "@/components/MonthNav";
import TabBar from "@/components/ui/TabBar";
import { useAnalytics } from "@/hooks/useAnalytics";
import { monthLabel, monthShort } from "@/utils/analytics";
import AnalyticsStatCards from "@/components/analytics/AnalyticsStatCards";
import AnalyticsBarChart from "@/assets/icons/ChartBarMonthly";
import InsightCards from "@/components/analytics/InsightCards";
import MoMDiffList from "@/components/analytics/MoMDiffList";
import CategoryBreakdownTable from "@/components/analytics/CategoryBreakdownTable";
import CategoryDonutPanel from "@/components/analytics/CategoryDonutPanel";
import CategoryDetailList from "@/components/analytics/CategoryDetailList";

const TABS = [
  { id: "overview" as const, label: "Overview" },
  { id: "categories" as const, label: "By Category" },
];

export default function AnalyticsPage() {
  const {
    month,
    setMonth,
    activeTab,
    setActiveTab,
    data,
    loading,
    error,
    prev,
    inflow,
    outflow,
    net,
    savingsRate,
    diffInflow,
    diffOutflow,
    pctInflow,
    pctOutflow,
    cats,
    totalOut,
    incCats,
    totalIn,
  } = useAnalytics();

  const chartFirst = data?.monthly[0];
  const chartLast = data?.monthly.find((m) => m.month === month);

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-5 lg:pt-7 pb-0 flex items-center justify-between shrink-0 gap-3">
        <div className="min-w-0">
          <h1 className="text-[18px] sm:text-[22px] font-bold text-text-primary m-0 tracking-[-0.02em] truncate">
            Analytics
          </h1>
          <p className="text-[12px] sm:text-[13px] text-text-secondary mt-[3px] mb-0 truncate">
            {monthLabel(month)}
            {prev ? ` · vs ${monthShort(prev.month)}` : ""}
          </p>
        </div>
        <div className="shrink-0">
          <MonthNav month={month} setMonth={setMonth} />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex px-4 sm:px-6 lg:px-8 pt-4 lg:pt-[18px] pb-4 shrink-0">
        <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-0 lg:pt-[18px] pb-10">
        {loading && (
          <div className="flex items-center justify-center h-[200px] text-text-muted text-[14px]">
            Loading...
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-[200px] text-text-expense text-[14px]">
            {error}
          </div>
        )}

        {!loading && !error && activeTab === "overview" && (
          <>
            <AnalyticsStatCards
              inflow={inflow}
              outflow={outflow}
              net={net}
              savingsRate={savingsRate}
              diffInflow={diffInflow}
              diffOutflow={diffOutflow}
              pctInflow={pctInflow}
              pctOutflow={pctOutflow}
              prev={prev}
            />

            {/* Cash flow card */}
            <div className="bg-bg-white rounded-xl px-4 sm:px-7 py-5 sm:py-[22px] border border-border-default mb-3 sm:mb-4 lg:mb-[18px]">
              <div className="mb-4 sm:mb-5">
                <div className="text-[15px] font-bold text-text-primary">
                  Monthly Cash Flow
                </div>
                <div className="text-[12px] text-text-muted mt-[3px]">
                  {chartFirst
                    ? `${monthLabel(chartFirst.month)} – ${chartLast ? monthLabel(chartLast.month) : ""}`
                    : ""}
                </div>
              </div>

              {/* Bar chart + insights: side-by-side on lg, stacked below */}
              <div className="flex flex-col lg:flex-row lg:gap-7 lg:items-start gap-5">
                <div className="min-w-0 lg:w-1/2">
                  <div className="overflow-x-auto">
                    {data && (
                      <AnalyticsBarChart
                        months={data.monthly}
                        activeMonth={month}
                      />
                    )}
                  </div>
                  <div className="flex gap-4 items-center mt-3">
                    {(
                      [
                        ["#2A9D5C", "Inflow"],
                        ["#D1FF19", "Outflow"],
                      ] as const
                    ).map(([col, lbl]) => (
                      <div key={lbl} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: col }}
                        />
                        <span className="text-[12px] text-text-secondary">
                          {lbl}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {data?.insights && (
                  <div className="flex flex-col gap-2 lg:flex-[0_0_47%] lg:min-w-0">
                    <InsightCards
                      insights={data.insights}
                      eventSummary={data.eventSummary}
                    />
                    {prev &&
                      (data.insights.expenseDiff.length > 0 ||
                        data.insights.incomeDiff.length > 0) && (
                        <MoMDiffList
                          prev={prev}
                          expenseDiffs={data.insights.expenseDiff}
                          incomeDiffs={data.insights.incomeDiff}
                        />
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Category breakdown tables: side-by-side on lg, stacked below */}
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-3.5">
              {cats.length > 0 && (
                <CategoryBreakdownTable
                  type="expense"
                  month={month}
                  cats={cats}
                  total={totalOut}
                  prev={prev}
                />
              )}
              {incCats.length > 0 && (
                <CategoryBreakdownTable
                  type="income"
                  month={month}
                  cats={incCats}
                  total={totalIn}
                  prev={prev}
                />
              )}
            </div>
          </>
        )}

        {!loading && !error && activeTab === "categories" && (
          <div className="flex flex-col gap-5 lg:gap-6">
            {/* Expense section */}
            <div className="flex flex-col gap-2 md:flex-row md:gap-5">
              <CategoryDonutPanel
                type="expense"
                month={month}
                cats={cats}
                total={totalOut}
              />
              <CategoryDetailList
                type="expense"
                month={month}
                cats={cats}
                total={totalOut}
              />
            </div>

            {/* Income section */}
            {incCats.length > 0 && (
              <div className="flex flex-col gap-2 md:flex-row md:gap-5">
                <CategoryDonutPanel
                  type="income"
                  month={month}
                  cats={incCats}
                  total={totalIn}
                />
                <CategoryDetailList
                  type="income"
                  month={month}
                  cats={incCats}
                  total={totalIn}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
