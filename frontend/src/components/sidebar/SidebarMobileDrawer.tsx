import { SIDEBAR_FULL } from "@/constants/sidebar";
import SidebarLogoButton from "./SidebarLogoButton";
import SidebarNavItems from "./SidebarNavItems";
import SidebarUserSection from "./SidebarUserSection";

interface SidebarMobileDrawerProps {
  drawerVisible: boolean;
  user: { name?: string; email: string } | null;
  onClose: () => void;
  onLogoClick: () => void;
  onLogout: () => void;
}

export default function SidebarMobileDrawer({
  drawerVisible,
  user,
  onClose,
  onLogoClick,
  onLogout,
}: SidebarMobileDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[200] transition-[background] duration-[250ms] ease-in-out"
        style={{
          background: drawerVisible ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
        }}
      />

      {/* Drawer */}
      <div
        className="bg-dark flex flex-col fixed left-0 top-0 h-screen z-[201] transition-transform duration-[250ms] ease-in-out"
        style={{
          width: SIDEBAR_FULL,
          transform: drawerVisible
            ? "translateX(0)"
            : `translateX(-${SIDEBAR_FULL}px)`,
        }}
      >
        <SidebarLogoButton showText onClick={onLogoClick} />
        <SidebarNavItems labels onClick={onClose} />
        <SidebarUserSection showText user={user} onLogout={onLogout} />
      </div>
    </>
  );
}
