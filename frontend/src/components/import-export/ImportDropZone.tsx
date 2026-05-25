import IconUpload from "@/assets/icons/IconUpload";

interface ImportDropZoneProps {
  dragOver: boolean;
  file: File | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
}

export default function ImportDropZone({
  dragOver,
  file,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}: ImportDropZoneProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={[
        "border-2 border-dashed rounded-xl p-9 flex flex-col items-center gap-3 cursor-pointer transition-all duration-150",
        dragOver
          ? "border-bg-lime bg-surface-lime"
          : "border-[#DDDDD8] bg-[#FAFAF8]",
      ].join(" ")}
    >
      <div
        className={[
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-150 shrink-0",
          dragOver ? "bg-dark" : "bg-[#F0F0EA]",
        ].join(" ")}
      >
        <IconUpload color={dragOver ? "#D1FF19" : "#aaa"} />
      </div>
      <div className="text-center">
        <div
          className={[
            "text-sm font-semibold mb-1",
            dragOver ? "text-text-primary" : "text-[#444]",
          ].join(" ")}
        >
          {file ? file.name : "Drop your file here"}
        </div>
        <div className="text-xs text-[#bbb]">
          {file
            ? `${(file.size / 1024).toFixed(1)} KB · click to replace`
            : "or click to browse · .xlsx or .csv"}
        </div>
      </div>
    </div>
  );
}
