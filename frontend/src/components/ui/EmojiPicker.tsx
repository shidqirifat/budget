import { useEffect, useRef } from "react";
import { EMOJI_LIST } from "@/utils/emoji";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-[100] bg-bg-white border border-border-input rounded-xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
    >
      <div className="w-80" />
      {EMOJI_LIST.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="text-xl p-1 border-none bg-transparent cursor-pointer rounded-md leading-none hover:bg-bg-primary transition-colors"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
