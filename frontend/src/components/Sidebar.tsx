import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/hooks/useSidebar";
import SidebarDesktop from "./sidebar/SidebarDesktop";
import SidebarMobileTopbar from "./sidebar/SidebarMobileTopbar";
import SidebarMobileDrawer from "./sidebar/SidebarMobileDrawer";

interface SidebarProps {
  onWidthChange?: (width: number) => void;
  onTopbarHeight?: (height: number) => void;
}

export default function Sidebar({
  onWidthChange,
  onTopbarHeight,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const {
    isMobile,
    drawerOpen,
    drawerVisible,
    currentWidth,
    showLabels,
    closeDrawer,
    handleLogoClick,
  } = useSidebar({ onWidthChange, onTopbarHeight });

  return (
    <>
      {!isMobile && (
        <SidebarDesktop
          width={currentWidth}
          showLabels={showLabels}
          user={user}
          onLogoClick={handleLogoClick}
          onLogout={logout}
        />
      )}

      {isMobile && (
        <SidebarMobileTopbar
          drawerOpen={drawerOpen}
          onLogoClick={handleLogoClick}
        />
      )}

      {isMobile && drawerOpen && (
        <SidebarMobileDrawer
          drawerVisible={drawerVisible}
          user={user}
          onClose={closeDrawer}
          onLogoClick={handleLogoClick}
          onLogout={logout}
        />
      )}
    </>
  );
}
