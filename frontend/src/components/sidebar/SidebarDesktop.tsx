import SidebarLogoButton from "./SidebarLogoButton";
import SidebarNavItems from "./SidebarNavItems";
import SidebarUserSection from "./SidebarUserSection";

interface SidebarDesktopProps {
  width: number;
  showLabels: boolean;
  user: { name?: string; email: string } | null;
  onLogoClick: () => void;
  onLogout: () => void;
}

export default function SidebarDesktop({
  width,
  showLabels,
  user,
  onLogoClick,
  onLogout,
}: SidebarDesktopProps) {
  return (
    <div
      className="bg-dark flex flex-col fixed left-0 top-0 h-screen z-[100] overflow-hidden transition-[width,min-width] duration-200 ease-in-out"
      style={{ width, minWidth: width }}
    >
      <SidebarLogoButton showText={showLabels} onClick={onLogoClick} />
      <SidebarNavItems labels={showLabels} />
      <SidebarUserSection
        showText={showLabels}
        user={user}
        onLogout={onLogout}
      />
    </div>
  );
}
