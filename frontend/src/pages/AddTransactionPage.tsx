import { useNavigate } from "react-router-dom";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { useTransactionForm } from "@/hooks/useTransactionForm";
import { useReceiptScanner } from "@/hooks/useReceiptScanner";
import TransactionFormFields from "@/components/transactions/TransactionFormFields";
import ReceiptScannerPanel from "@/components/transactions/ReceiptScannerPanel";
import IconArrowLeft from "@/assets/icons/IconArrowLeft";
import IconTrash from "@/assets/icons/IconTrash";
import IconSpinner from "@/assets/icons/IconSpinner";
import IconCheck from "@/assets/icons/IconCheck";

export default function AddTransactionPage() {
  const navigate = useNavigate();
  const isMobile = useWindowWidth() < 768;

  const form = useTransactionForm();
  const scanner = useReceiptScanner();

  function handleApply() {
    scanner.applyToForm({
      setAmount: form.setAmount,
      setDate: form.setDate,
      setNote: form.setNote,
    });
  }

  return (
    <div
      className={`bg-bg-primary flex flex-col ${isMobile ? "" : "h-full overflow-hidden"}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between bg-bg-white border-b border-border-default shrink-0 flex-wrap gap-2.5 ${isMobile ? "px-4 py-3.5" : "px-8 py-[18px]"}`}
      >
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-text-secondary text-[13px] bg-transparent border-none cursor-pointer py-1.5 px-0"
          >
            <IconArrowLeft />
            {!isMobile && "Back"}
          </button>
          <div className="w-px h-5 bg-border-default" />
          <h1
            className={`font-bold text-text-primary tracking-tight m-0 ${isMobile ? "text-base" : "text-lg"}`}
          >
            {form.editingTx ? "Edit Transaction" : "New Transaction"}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {form.saveError && (
            <span className="text-xs text-text-expense">{form.saveError}</span>
          )}

          {form.editingTx && (
            <button
              onClick={form.handleDelete}
              disabled={form.deleting || form.saving}
              className={`flex items-center gap-[7px] border border-red-200 rounded-lg text-text-expense text-[13px] font-semibold cursor-pointer transition-all duration-150 disabled:cursor-default
                ${form.deleting ? "bg-red-50" : "bg-bg-white hover:bg-red-50"}
                ${isMobile ? "px-3.5 py-2" : "px-5 py-2.5"}`}
            >
              <IconTrash />
              {form.deleting ? "Deleting…" : "Delete"}
            </button>
          )}

          <button
            onClick={form.handleSave}
            disabled={form.saving || form.deleting}
            className={`flex items-center gap-1.5 border-none rounded-lg bg-bg-lime text-text-primary font-bold text-[13px] tracking-tight cursor-pointer disabled:cursor-default
              ${form.saving ? "opacity-70" : ""}
              ${isMobile ? "px-3 py-2" : "px-7 py-2.5"}`}
          >
            {isMobile ? (
              form.saving ? (
                <IconSpinner />
              ) : (
                <IconCheck />
              )
            ) : form.saving ? (
              "Saving…"
            ) : (
              "Save Transaction"
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        className={`flex-1 flex gap-5 ${isMobile ? "flex-col p-4" : "flex-row px-8 py-6 overflow-hidden"}`}
      >
        {isMobile && (
          <ReceiptScannerPanel
            mode="mobile"
            dragOver={scanner.dragOver}
            parsed={scanner.parsed}
            receiptOpen={scanner.receiptOpen}
            onToggle={() => scanner.setReceiptOpen(!scanner.receiptOpen)}
            onDragOver={scanner.onDragOver}
            onDragLeave={scanner.onDragLeave}
            onDrop={scanner.onDrop}
            onClickUpload={scanner.onClickUpload}
            onApply={handleApply}
          />
        )}

        <TransactionFormFields
          isMobile={isMobile}
          typeName={form.typeName}
          amount={form.amount}
          date={form.date}
          catId={form.catId}
          subCatId={form.subCatId}
          note={form.note}
          eventId={form.eventId}
          amountError={form.amountError}
          categoryError={form.categoryError}
          categories={form.categories}
          subCats={form.subCats}
          events={form.events}
          amountRef={form.amountRef}
          categoryRef={form.categoryRef}
          onTypeChange={(t) => {
            form.setTypeName(t);
            form.setCatId("");
            form.setSubCatId("");
          }}
          onAmountChange={(v) => {
            form.setAmount(v);
            form.setAmountError("");
          }}
          onDateChange={form.setDate}
          onCatChange={(id) => {
            form.setCatId(id);
            form.setSubCatId("");
            form.setCategoryError("");
          }}
          onSubCatChange={form.setSubCatId}
          onNoteChange={form.setNote}
          onEventChange={form.setEventId}
        />

        {!isMobile && (
          <ReceiptScannerPanel
            mode="desktop"
            dragOver={scanner.dragOver}
            parsed={scanner.parsed}
            receiptOpen={scanner.receiptOpen}
            onToggle={() => scanner.setReceiptOpen(!scanner.receiptOpen)}
            onDragOver={scanner.onDragOver}
            onDragLeave={scanner.onDragLeave}
            onDrop={scanner.onDrop}
            onClickUpload={scanner.onClickUpload}
            onApply={handleApply}
          />
        )}
      </div>
    </div>
  );
}
