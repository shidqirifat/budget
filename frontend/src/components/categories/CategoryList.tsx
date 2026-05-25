import { Category } from "@/services/category.service";
import CategoryListItem from "./CategoryListItem";

interface CategoryListProps {
  categories: Category[];
  activeTab: "expense" | "income";
  selectedId: string | null;
  onTabChange: (tab: "expense" | "income") => void;
  onSelect: (id: string) => void;
}

export default function CategoryList({
  categories,
  activeTab,
  selectedId,
  onTabChange,
  onSelect,
}: CategoryListProps) {
  const tabs = (["expense", "income"] as const).map((tab) => ({
    tab,
    count: categories.filter((c) => c.type.name === tab).length,
    color: tab === "income" ? "text-text-income" : "text-text-expense",
    borderColor:
      tab === "income" ? "border-text-income" : "border-text-expense",
  }));

  const filtered = categories.filter((c) => c.type.name === activeTab);

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border-default shrink-0">
        {tabs.map(({ tab, count, color, borderColor }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={[
                "flex-1 py-3 border-none bg-transparent cursor-pointer -mb-px transition-colors",
                "border-b-2",
                isActive
                  ? `${borderColor} ${color}`
                  : "border-transparent text-text-muted",
              ].join(" ")}
            >
              <span className="text-[11px] font-semibold tracking-[0.06em]">
                {tab.toUpperCase()}
              </span>
              <span
                className={`text-[10px] ml-1.5 font-normal ${isActive ? color : "text-text-muted"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category rows */}
      <div className="overflow-y-auto flex-1">
        {filtered.map((cat) => (
          <CategoryListItem
            key={cat.id}
            category={cat}
            isActive={selectedId === cat.id}
            onClick={() => onSelect(cat.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="p-6 text-center text-text-muted text-[13px]">
            No categories yet
          </div>
        )}
      </div>
    </div>
  );
}
