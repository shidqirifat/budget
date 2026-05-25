import { Category } from "@/services/category.service";
import type { TransactionFilter, TransactionFilterActions, FilterOptions } from "@/hooks/useTransactionFilter";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";

interface Props {
  filter: TransactionFilter;
  actions: TransactionFilterActions;
  options: FilterOptions;
  categories: Category[];
  resultCount: number;
}

export default function TransactionFilter({ filter, actions, options, resultCount }: Props) {
  return (
    <div className="bg-bg-white border border-border-default rounded-[10px] px-[18px] py-[14px] flex items-center gap-[14px] max-md:flex-col max-md:items-stretch max-md:gap-2.5">
      <span className="text-[11px] font-semibold text-text-muted tracking-[0.07em] whitespace-nowrap uppercase">
        Filter by
      </span>

      <Select
        label="Category"
        value={filter.categoryId}
        active={!!filter.categoryId}
        onChange={(e) => actions.setCategoryId(e.target.value)}
        className="flex-1"
      >
        <option value="">All categories</option>
        {options.catOptions.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </Select>

      <Select
        label="Sub-category"
        value={filter.subCategoryId}
        active={!!filter.subCategoryId}
        disabled={!filter.categoryId}
        onChange={(e) => actions.setSubCategoryId(e.target.value)}
        className="flex-1"
      >
        <option value="">All sub-categories</option>
        {options.subOptions.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </Select>

      {/* Active filter badges */}
      <div className="flex gap-2 flex-wrap flex-[2]">
        {filter.categoryId && (
          <Badge
            variant="active"
            onRemove={() => actions.setCategoryId("")}
          >
            {options.catOptions.find((c) => c.id === filter.categoryId)?.name}
          </Badge>
        )}
        {filter.subCategoryId && (
          <Badge
            variant="default"
            onRemove={() => actions.setSubCategoryId("")}
          >
            {options.subOptions.find((s) => s.id === filter.subCategoryId)?.name}
          </Badge>
        )}
        {options.hasFilter && (
          <button
            type="button"
            onClick={actions.clearFilters}
            className="px-3 py-0.5 rounded-full border border-border-input bg-bg-white text-text-secondary text-xs cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      <span className="text-xs text-text-muted whitespace-nowrap shrink-0">
        {resultCount} result{resultCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
