import { useState } from "react";
import { useImport } from "@/hooks/useImport";
import { useExport } from "@/hooks/useExport";
import ImportTemplateCard from "@/components/import-export/ImportTemplateCard";
import ImportColumnReference from "@/components/import-export/ImportColumnReference";
import ImportDropZone from "@/components/import-export/ImportDropZone";
import ImportReviewTable from "@/components/import-export/ImportReviewTable";
import ImportGuidePanel from "@/components/import-export/ImportGuidePanel";
import ExportFormatCards from "@/components/import-export/ExportFormatCards";
import ExportFilterPanel from "@/components/import-export/ExportFilterPanel";

export default function ImportExportPage() {
  const [tab, setTab] = useState<"import" | "export">("import");

  const {
    dragOver,
    setDragOver,
    file,
    reviewRows,
    parseStage,
    importResult,
    submitError,
    fileRef,
    expenseCategories,
    incomeCategories,
    handleDrop,
    handleFileInput,
    handleImport,
    downloadTemplate,
    resetImport,
    errCount,
  } = useImport();

  const {
    exportFormat,
    setExportFormat,
    exporting,
    exportFrom,
    setExportFrom,
    exportTo,
    setExportTo,
    exportEventId,
    setExportEventId,
    events,
    handleExport,
    resetFilters,
  } = useExport();

  return (
    <div className="h-full flex flex-col bg-bg-primary overflow-hidden max-md:h-auto max-md:overflow-visible">
      {/* Header */}
      <div className="px-8 pt-7 pb-0 shrink-0 max-md:px-4 max-md:pt-5">
        <h1 className="text-[22px] font-bold text-text-primary m-0 tracking-tight">
          Import / Export
        </h1>
        <p className="text-[13px] text-text-secondary mt-[3px] mb-0">
          Bulk-add transactions from a CSV file, or export your data.
        </p>
      </div>

      {/* Tab bar */}
      <div className="px-8 pt-[18px] pb-3 shrink-0 max-md:px-4 max-md:pt-3.5">
        <div className="flex bg-surface-card border border-border-default rounded-[10px] p-1 w-fit">
          {(["import", "export"] as const).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "px-[26px] py-2 rounded-[7px] border-none cursor-pointer text-[13px] capitalize transition-all duration-100 hover:opacity-85",
                  active
                    ? "bg-dark text-bg-lime font-bold"
                    : "bg-transparent text-[#888] font-normal",
                ].join(" ")}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 max-md:px-4 max-md:pb-6 max-md:flex-none max-md:overflow-visible">
        {/* ── IMPORT TAB ───────────────────────────────────────── */}
        {tab === "import" && (
          <div className="flex gap-5 flex-row max-md:flex-col">
            {/* Left: main flow */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              {/* Step 1: template */}
              <div className="bg-surface-card rounded-xl p-6 border border-border-default flex flex-col gap-4">
                <div className="text-[11px] font-semibold text-text-muted tracking-[0.07em] uppercase flex items-center gap-2">
                  STEP 1
                  <span className="font-normal text-[#ccc] tracking-normal normal-case text-[11px]">
                    Prepare your file
                  </span>
                </div>

                <div className="flex items-center gap-5">
                  <ImportTemplateCard onDownload={downloadTemplate} />
                </div>

                <ImportColumnReference />
              </div>

              {/* Step 2: upload */}
              <div className="bg-surface-card rounded-xl p-6 border border-border-default">
                <div className="text-[11px] font-semibold text-text-muted tracking-[0.07em] uppercase flex items-center gap-2 mb-4">
                  STEP 2
                  <span className="font-normal text-[#ccc] tracking-normal normal-case text-[11px]">
                    Upload your file
                  </span>
                </div>

                <ImportDropZone
                  dragOver={dragOver}
                  file={file}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* Step 3: review */}
              {parseStage !== "idle" && (
                <div className="bg-surface-card rounded-xl p-6 border border-border-default">
                  <div className="text-[11px] font-semibold text-text-muted tracking-[0.07em] uppercase flex items-center gap-2 mb-4">
                    STEP 3
                    <span className="font-normal text-[#ccc] tracking-normal normal-case text-[11px]">
                      Review & confirm
                    </span>
                  </div>

                  <ImportReviewTable
                    reviewRows={reviewRows}
                    parseStage={parseStage}
                    importResult={importResult}
                    submitError={submitError}
                    errCount={errCount}
                    onImport={handleImport}
                    onReset={resetImport}
                  />
                </div>
              )}
            </div>

            {/* Right: guide panel */}
            <div className="w-64 shrink-0 lg:sticky lg:top-0 lg:self-start lg:max-h-[calc(100vh-160px)] flex flex-col max-md:w-full">
              <ImportGuidePanel
                expenseCategories={expenseCategories}
                incomeCategories={incomeCategories}
              />
            </div>
          </div>
        )}

        {/* ── EXPORT TAB ───────────────────────────────────────── */}
        {tab === "export" && (
          <div className="flex gap-5 items-start min-w-0 max-md:flex-col">
            {/* Left: format cards */}
            <div className="flex-1">
              <ExportFormatCards
                exportFormat={exportFormat}
                exporting={exporting}
                exportFrom={exportFrom}
                exportTo={exportTo}
                exportEventId={exportEventId}
                events={events}
                onExport={handleExport}
                onFormatHover={setExportFormat}
                onResetFilters={resetFilters}
              />
            </div>

            {/* Right: filter panel */}
            <div className="w-64 shrink-0 max-md:w-full">
              <ExportFilterPanel
                exportFrom={exportFrom}
                exportTo={exportTo}
                exportEventId={exportEventId}
                events={events}
                onFromChange={setExportFrom}
                onToChange={setExportTo}
                onEventChange={setExportEventId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
