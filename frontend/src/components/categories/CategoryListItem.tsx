import Avatar from "@/components/ui/Avatar";
import { Category } from "@/services/category.service";

interface CategoryListItemProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}

export default function CategoryListItem({
  category,
  isActive,
  onClick,
}: CategoryListItemProps) {
  const subCount = category._count?.subCategories ?? 0;
  return (
    <div
      onClick={onClick}
      className={[
        "flex items-center gap-3 px-4 py-[11px] cursor-pointer transition-colors border-b border-border-default",
        "border-l-[3px]",
        isActive
          ? "bg-[#FAFDE8] border-l-bg-lime"
          : "bg-bg-white border-l-transparent hover:bg-bg-primary",
      ].join(" ")}
    >
      <Avatar icon={category.icon} name={category.name} size="md" />
      <div className="flex-1 min-w-0">
        <div
          className={`text-[13px] truncate text-text-primary ${isActive ? "font-bold" : "font-medium"}`}
        >
          {category.name}
        </div>
        {subCount > 0 && (
          <div className="text-[11px] text-text-muted mt-0.5">
            {subCount} sub-categories
          </div>
        )}
      </div>
    </div>
  );
}
