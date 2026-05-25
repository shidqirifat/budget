interface SidebarLogoButtonProps {
  showText: boolean;
  onClick: () => void;
}

export default function SidebarLogoButton({
  showText,
  onClick,
}: SidebarLogoButtonProps) {
  return (
    <div
      className={`flex items-center pt-6 pb-4 px-5 cursor-pointer ${showText ? "gap-3 justify-start" : "gap-0 justify-center"}`}
      onClick={onClick}
    >
      <img
        src="/logo.png"
        alt="Budget"
        className="w-9 h-9 rounded-lg object-cover shrink-0"
      />
      {showText && (
        <span className="text-white font-bold text-base tracking-tight">
          Budget
        </span>
      )}
    </div>
  );
}
