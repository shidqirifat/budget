import { TOPBAR_HEIGHT } from "@/constants/sidebar";

interface SidebarMobileTopbarProps {
  drawerOpen: boolean;
  onLogoClick: () => void;
}

export default function SidebarMobileTopbar({
  drawerOpen,
  onLogoClick,
}: SidebarMobileTopbarProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[150] bg-bg-white flex items-center px-4 border-b border-border-default"
      style={{ height: TOPBAR_HEIGHT }}
    >
      {!drawerOpen && (
        <img
          src="/logo.png"
          alt="Budget"
          onClick={onLogoClick}
          className="w-9 h-9 rounded-lg object-cover cursor-pointer"
        />
      )}
    </div>
  );
}
