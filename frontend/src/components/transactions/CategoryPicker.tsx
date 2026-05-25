import { Category, SubCategory } from "@/services/category.service";
import IconAlertCircle from "@/assets/icons/IconAlertCircle";

interface Props {
  categories: Category[];
  subCats: SubCategory[];
  catId: string;
  subCatId: string;
  categoryError: string;
  onSelectCat: (id: string) => void;
  onSelectSubCat: (id: string) => void;
  categoryRef: React.RefObject<HTMLDivElement>;
}

export default function CategoryPicker({
  categories,
  subCats,
  catId,
  subCatId,
  categoryError,
  onSelectCat,
  onSelectSubCat,
  categoryRef,
}: Props) {
  return (
    <div
      ref={categoryRef}
      className={`bg-bg-white rounded-xl p-4 md:p-6 border ${categoryError ? "border-red-200" : "border-border-default"}`}
    >
      <div className="text-[11px] font-semibold text-text-muted tracking-[0.07em] mb-2.5 flex items-center gap-2">
        CATEGORY
      </div>

      {categories.length === 0 ? (
        <div className="text-sm text-text-muted">Loading categories…</div>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => {
            const sel = catId === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCat(cat.id)}
                className={`flex flex-col items-center gap-1.5 px-3.5 py-3 rounded-xl cursor-pointer min-w-[76px] border-2 transition-all duration-100
                  ${sel ? "border-bg-lime bg-lime-50" : "border-border-default bg-bg-white"}`}
              >
                <div
                  className={`w-[38px] h-[38px] rounded-full flex items-center justify-center text-[15px] font-bold text-text-secondary
                    ${sel ? "bg-lime-100" : "bg-neutral-100"}`}
                >
                  {cat.name.slice(0, 1).toUpperCase()}
                </div>
                <span
                  className={`text-[11px] text-center leading-tight ${sel ? "font-bold text-text-primary" : "font-normal text-text-secondary"}`}
                >
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {catId && (
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <div className="text-[11px] font-semibold text-text-muted tracking-[0.07em] mb-2.5 flex items-center gap-2">
            SUB-CATEGORY
            <span className="font-normal text-neutral-300 tracking-normal text-[11px]">(optional)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {subCats.map((s) => {
              const sel = subCatId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onSelectSubCat(sel ? "" : s.id)}
                  className={`px-4 py-[7px] rounded-full border-none cursor-pointer text-xs transition-all duration-100
                    ${sel ? "bg-text-primary text-bg-lime font-semibold" : "bg-neutral-100 text-text-secondary font-normal"}`}
                >
                  {s.name}
                </button>
              );
            })}
            {subCats.length === 0 && (
              <span className="text-xs text-text-muted">No sub-categories.</span>
            )}
          </div>
        </div>
      )}

      {categoryError && (
        <div className="mt-3 text-xs text-text-expense flex items-center gap-1">
          <IconAlertCircle />
          {categoryError}
        </div>
      )}
    </div>
  );
}
