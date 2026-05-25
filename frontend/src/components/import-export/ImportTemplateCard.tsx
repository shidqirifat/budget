import IconFileCheck from "@/assets/icons/IconFileCheck";
import IconDownload from "@/assets/icons/IconDownload";

interface ImportTemplateCardProps {
  onDownload: () => void;
}

export default function ImportTemplateCard({
  onDownload,
}: ImportTemplateCardProps) {
  return (
    <div className="flex flex-wrap xs:flex-nowrap items-center gap-4 flex-1 bg-bg-primary rounded-[10px] p-[18px_20px] border border-border-default">
      <div className="w-12 h-12 bg-dark rounded-[10px] flex items-center justify-center shrink-0">
        <IconFileCheck />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-text-primary mb-0.5">
          template.xlsx
        </div>
        <div className="text-xs text-text-muted leading-[1.5]">
          2 sheets · Import Data + Categories reference
        </div>
      </div>
      <button
        onClick={onDownload}
        className="shrink-0 w-full xs:w-auto flex items-center justify-center gap-[7px] px-[18px] py-[9px] rounded-lg bg-bg-lime text-text-primary text-xs font-bold cursor-pointer hover:opacity-85 transition-opacity"
      >
        <IconDownload size={13} />
        Download Template
      </button>
    </div>
  );
}
