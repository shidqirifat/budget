import { ParsedReceipt } from "@/hooks/useReceiptScanner";
import IconChevronDown from "@/assets/icons/IconChevronDown";

interface Props {
  mode: "desktop" | "mobile";
  dragOver: boolean;
  parsed: ParsedReceipt | null;
  receiptOpen: boolean;
  onToggle: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClickUpload: () => void;
  onApply: () => void;
}

const parsedFields: [string, keyof ParsedReceipt][] = [
  ["Amount", "amount"],
  ["Date", "date"],
  ["Merchant", "merchant"],
];

function DropZone({
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onClickUpload,
  compact,
}: {
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClickUpload: () => void;
  compact?: boolean;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClickUpload}
      className={`border-2 border-dashed rounded-xl flex flex-col items-center gap-2.5 cursor-pointer transition-all duration-150
        ${dragOver ? "border-bg-lime bg-[#182300]" : "border-[#272727] bg-[#1a1a1a]"}
        ${compact ? "py-7 px-4" : "py-8 px-4"}`}
    >
      <div className="text-[30px]">📷</div>
      <div className="text-xs text-text-secondary text-center leading-relaxed">
        Drag & drop receipt<br />or click to browse
      </div>
    </div>
  );
}

function ParsedSection({
  parsed,
  onApply,
}: {
  parsed: ParsedReceipt | null;
  onApply: () => void;
}) {
  return (
    <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
      <div className="text-[10px] font-semibold text-[#888] tracking-[0.07em] mb-3">
        PARSED FROM RECEIPT
      </div>
      {parsedFields.map(([label, key]) => (
        <div
          key={key}
          className="flex justify-between mb-2.5 pb-2.5 border-b border-[#2a2a2a]"
        >
          <span className="text-xs text-[#aaa]">{label}</span>
          <span className={`text-xs ${parsed ? "text-bg-lime font-semibold" : "text-[#666] font-normal"}`}>
            {parsed ? parsed[key] : "—"}
          </span>
        </div>
      ))}
      <button
        onClick={onApply}
        disabled={!parsed}
        className={`w-full py-2.5 rounded-lg border-none text-xs font-bold transition-all duration-150
          ${parsed ? "bg-[#1e2d00] text-bg-lime cursor-pointer" : "bg-[#1a1a1a] text-[#666] cursor-default"}`}
      >
        Apply to Form →
      </button>
    </div>
  );
}

export default function ReceiptScannerPanel({
  mode,
  dragOver,
  parsed,
  receiptOpen,
  onToggle,
  onDragOver,
  onDragLeave,
  onDrop,
  onClickUpload,
  onApply,
}: Props) {
  if (mode === "mobile") {
    return (
      <div className="rounded-xl overflow-hidden bg-text-primary">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-[18px] py-3.5 bg-transparent border-none cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">📷</span>
            <span className="text-sm font-bold text-bg-lime">Receipt Scanner</span>
          </div>
          <IconChevronDown
            className="transition-transform duration-200"
            style={{ transform: receiptOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        <div
          className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
          style={{ maxHeight: receiptOpen ? 600 : 0 }}
        >
          <div className="px-[18px] pb-[18px]">
            <div className="text-xs text-[#aaa] mb-4 leading-relaxed">
              Upload a receipt image to auto-fill fields above.
            </div>
            <DropZone
              dragOver={dragOver}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClickUpload={onClickUpload}
              compact
            />
            <ParsedSection parsed={parsed} onApply={onApply} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[288px] shrink-0">
      <div className="bg-text-primary rounded-xl p-5 sticky top-0">
        <div className="text-sm font-bold text-bg-lime mb-1">Receipt Scanner</div>
        <div className="text-xs text-[#aaa] mb-4 leading-relaxed">
          Upload a receipt image to auto-fill fields above.
        </div>
        <DropZone
          dragOver={dragOver}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClickUpload={onClickUpload}
        />
        <ParsedSection parsed={parsed} onApply={onApply} />
      </div>
    </div>
  );
}
