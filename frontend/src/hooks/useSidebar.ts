import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  SIDEBAR_FULL,
  SIDEBAR_ICON,
  MOBILE_BREAKPOINT,
  TOPBAR_HEIGHT,
} from "@/constants/sidebar";

interface UseSidebarOptions {
  onWidthChange?: (width: number) => void;
  onTopbarHeight?: (height: number) => void;
}

export function useSidebar({
  onWidthChange,
  onTopbarHeight,
}: UseSidebarOptions) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT,
  );
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setDrawerOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentWidth = isMobile ? 0 : collapsed ? SIDEBAR_ICON : SIDEBAR_FULL;

  useEffect(() => {
    onWidthChange?.(currentWidth);
  }, [currentWidth, onWidthChange]);

  useEffect(() => {
    onTopbarHeight?.(isMobile ? TOPBAR_HEIGHT : 0);
  }, [isMobile, onTopbarHeight]);

  const closeDrawer = useCallback(() => {
    setDrawerVisible(false);
    setTimeout(() => setDrawerOpen(false), 250);
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    requestAnimationFrame(() => setDrawerVisible(true));
  }, []);

  // Close drawer on navigation
  useEffect(() => {
    if (drawerOpen) closeDrawer();
  }, [location.pathname]);

  const handleLogoClick = useCallback(() => {
    if (isMobile) {
      drawerOpen ? closeDrawer() : openDrawer();
    } else {
      setCollapsed((v) => !v);
    }
  }, [isMobile, drawerOpen, closeDrawer, openDrawer]);

  const showLabels = !collapsed && !isMobile;

  return {
    isMobile,
    collapsed,
    drawerOpen,
    drawerVisible,
    currentWidth,
    showLabels,
    openDrawer,
    closeDrawer,
    handleLogoClick,
  };
}
