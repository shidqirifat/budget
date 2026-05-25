import { NavLink, useLocation } from "react-router-dom";
import IconTransactions from "@/assets/icons/IconTransactions";
import IconAnalytics from "@/assets/icons/IconAnalytics";
import IconCategories from "@/assets/icons/IconCategories";
import IconEvents from "@/assets/icons/IconEvents";
import IconDownload from "@/assets/icons/IconDownload";
import { NAV } from "@/constants/sidebar";

const ICONS: Record<string, React.ReactNode> = {
  "/": <IconTransactions />,
  "/analytics": <IconAnalytics />,
  "/categories": <IconCategories />,
  "/events": <IconEvents />,
  "/import-export": <IconDownload size={16} color="currentColor" />,
};

interface SidebarNavItemsProps {
  labels: boolean;
  onClick?: () => void;
}

export default function SidebarNavItems({
  labels,
  onClick,
}: SidebarNavItemsProps) {
  const location = useLocation();

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <nav className="flex-1 px-[10px]">
      {NAV.map((item) => {
        const active = isActive(item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className="no-underline"
            onClick={onClick}
          >
            <div
              title={labels ? undefined : item.label}
              className={[
                "flex items-center rounded-lg mb-0.5 px-3 py-[10px] cursor-pointer transition-colors duration-100",
                labels ? "gap-[10px] justify-start" : "gap-0 justify-center",
                active
                  ? "bg-bg-lime text-text-primary"
                  : "bg-transparent text-dark-icon hover:bg-dark-surface",
              ].join(" ")}
            >
              <span
                className={`flex items-center shrink-0 ${active ? "text-text-primary" : "text-dark-icon"}`}
              >
                {ICONS[item.to]}
              </span>
              {labels && (
                <span
                  className={`text-[13px] ${active ? "font-bold text-text-primary" : "font-normal text-dark-label"}`}
                >
                  {item.label}
                </span>
              )}
            </div>
          </NavLink>
        );
      })}
    </nav>
  );
}
