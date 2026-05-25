interface Props {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  saving: boolean;
  onChangeName: (v: string) => void;
  onChangeStart: (v: string) => void;
  onChangeEnd: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function EventAddForm({
  name,
  startDate,
  endDate,
  description,
  saving,
  onChangeName,
  onChangeStart,
  onChangeEnd,
  onChangeDescription,
  onSave,
  onCancel,
}: Props) {
  return (
    <div className="px-4 py-3.5 border-t border-border-default">
      <input
        autoFocus
        value={name}
        onChange={(e) => onChangeName(e.target.value)}
        placeholder="Event name…"
        className="w-full px-3 py-2 rounded-lg border border-border-input text-[13px] text-text-primary outline-none mb-2 focus:border-text-primary transition-colors"
      />
      <div className="flex flex-col gap-2 mb-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChangeStart(e.target.value)}
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-border-input text-xs outline-none focus:border-text-primary transition-colors"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => onChangeEnd(e.target.value)}
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-border-input text-xs outline-none focus:border-text-primary transition-colors"
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => onChangeDescription(e.target.value)}
        placeholder="Description…"
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-border-input text-xs text-text-primary outline-none resize-none mb-2 focus:border-text-primary transition-colors"
      />
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 py-2 rounded-lg border-0 bg-bg-lime text-text-primary text-xs font-bold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Add"}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-lg border border-border-input bg-bg-white text-text-secondary text-xs cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
