import IconDoorExit from "@/assets/icons/IconDoorExit";

interface SidebarUserSectionProps {
  showText: boolean;
  user: { name?: string; email: string } | null;
  onLogout: () => void;
}

export default function SidebarUserSection({
  showText,
  user,
  onLogout,
}: SidebarUserSectionProps) {
  const displayName = user ? user.name || user.email : "U";

  return (
    <div
      className={`flex items-center border-t border-dark-surface px-4 py-[14px] ${showText ? "justify-between gap-[10px]" : "justify-center"}`}
    >
      <div className="flex items-center gap-[10px] min-w-0">
        <div className="w-8 h-8 rounded-full bg-dark-avatar flex items-center justify-center text-bg-lime text-xs font-bold shrink-0">
          {displayName[0].toUpperCase()}
        </div>
        {showText && (
          <span className="text-text-secondary text-xs font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
            {displayName}
          </span>
        )}
      </div>
      {showText && (
        <button
          onClick={onLogout}
          title="Sign out"
          className="text-dark-icon hover:text-bg-lime bg-transparent border-none cursor-pointer p-1 flex items-center shrink-0 transition-colors duration-100"
        >
          <IconDoorExit size={16} color="currentColor" />
        </button>
      )}
    </div>
  );
}
