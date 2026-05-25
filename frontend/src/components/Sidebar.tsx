import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import IconTransactions from '@/assets/icons/IconTransactions';
import IconAnalytics from '@/assets/icons/IconAnalytics';
import IconCategories from '@/assets/icons/IconCategories';
import IconEvents from '@/assets/icons/IconEvents';
import IconDownload from '@/assets/icons/IconDownload';

const NAV = [
  {
    to: '/',
    label: 'Transactions',
    icon: <IconTransactions />,
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: <IconAnalytics />,
  },
  {
    to: '/categories',
    label: 'Categories',
    icon: <IconCategories />,
  },
  {
    to: '/events',
    label: 'Events',
    icon: <IconEvents />,
  },
  {
    to: '/import-export',
    label: 'Import / Export',
    icon: <IconDownload size={16} color="currentColor" />,
  },
];

const SIDEBAR_FULL = 220;
const SIDEBAR_ICON = 64;
const MOBILE_BREAKPOINT = 1024;

const TOPBAR_HEIGHT = 52;

interface SidebarProps {
  onWidthChange?: (width: number) => void;
  onTopbarHeight?: (height: number) => void;
}

export default function Sidebar({ onWidthChange, onTopbarHeight }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setDrawerOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentWidth = isMobile ? 0 : collapsed ? SIDEBAR_ICON : SIDEBAR_FULL;

  useEffect(() => {
    onWidthChange?.(currentWidth);
  }, [currentWidth, onWidthChange]);

  useEffect(() => {
    onTopbarHeight?.(isMobile ? TOPBAR_HEIGHT : 0);
  }, [isMobile, onTopbarHeight]);

  // Close drawer when navigating
  useEffect(() => {
    if (drawerOpen) closeDrawer();
  }, [location.pathname]);

  const closeDrawer = useCallback(() => {
    setDrawerVisible(false);
    setTimeout(() => setDrawerOpen(false), 250);
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    requestAnimationFrame(() => setDrawerVisible(true));
  }, []);

  const handleLogoClick = useCallback(() => {
    if (isMobile) {
      drawerOpen ? closeDrawer() : openDrawer();
    } else {
      setCollapsed(v => !v);
    }
  }, [isMobile, drawerOpen, closeDrawer, openDrawer]);

  const showLabels = !collapsed && !isMobile;
  const sidebarWidth = currentWidth;

  const NavItems = ({ onClick, labels }: { onClick?: () => void; labels: boolean }) => (
    <nav style={{ flex: 1, padding: '0 10px' }}>
      {NAV.map(item => {
        const active = isActive(item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            style={{ textDecoration: 'none' }}
            onClick={onClick}
          >
            <div
              title={labels ? undefined : item.label}
              style={{
                display: 'flex', alignItems: 'center',
                gap: labels ? 10 : 0,
                justifyContent: labels ? 'flex-start' : 'center',
                padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                background: active ? '#D1FF19' : 'transparent',
                cursor: 'pointer', transition: 'background 0.12s',
                color: active ? '#111' : '#555',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#1e1e1e'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', color: active ? '#111' : '#555', flexShrink: 0 }}>
                {item.icon}
              </span>
              {labels && (
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, color: active ? '#111' : '#888' }}>
                  {item.label}
                </span>
              )}
            </div>
          </NavLink>
        );
      })}
    </nav>
  );

  const UserSection = ({ showText }: { showText: boolean }) => (
    <div style={{
      padding: '14px 16px', borderTop: '1px solid #1e1e1e',
      display: 'flex', alignItems: 'center',
      gap: showText ? 10 : 0,
      justifyContent: showText ? 'flex-start' : 'center',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', background: '#252525',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#D1FF19', fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>
        {(user?.name || user?.email || 'U')[0].toUpperCase()}
      </div>
      {showText && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#aaa', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || user?.email}
          </div>
          <button
            onClick={logout}
            style={{ color: '#444', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 1 }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );

  const LogoButton = ({ showText }: { showText: boolean }) => (
    <div
      style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', gap: showText ? 12 : 0, justifyContent: showText ? 'flex-start' : 'center', cursor: 'pointer' }}
      onClick={handleLogoClick}
    >
      <img src="/logo.png" alt="Budget" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
      {showText && (
        <span style={{ color: 'white', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Budget</span>
      )}
    </div>
  );

  return (
    <>
      {/* Static sidebar (desktop only) */}
      {!isMobile && (
        <div style={{
          width: sidebarWidth, minWidth: sidebarWidth, height: '100vh',
          background: '#141414', display: 'flex', flexDirection: 'column',
          position: 'fixed', left: 0, top: 0, zIndex: 100,
          transition: 'width 0.2s ease, min-width 0.2s ease',
          overflow: 'hidden',
        }}>
          <LogoButton showText={showLabels} />
          <NavItems labels={showLabels} />
          <UserSection showText={showLabels} />
        </div>
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 150,
          height: TOPBAR_HEIGHT, background: 'white',
          display: 'flex', alignItems: 'center', padding: '0 16px',
          borderBottom: '1px solid #EEEEE8',
        }}>
          {!drawerOpen && (
            <img
              src="/logo.png"
              alt="Budget"
              onClick={handleLogoClick}
              style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', cursor: 'pointer' }}
            />
          )}
        </div>
      )}

      {/* Mobile drawer overlay */}
      {isMobile && drawerOpen && (
        <>
          <div
            onClick={closeDrawer}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: drawerVisible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
              transition: 'background 0.25s ease',
            }}
          />
          <div style={{
            width: SIDEBAR_FULL, height: '100vh',
            background: '#141414', display: 'flex', flexDirection: 'column',
            position: 'fixed', left: 0, top: 0, zIndex: 201,
            transform: drawerVisible ? 'translateX(0)' : `translateX(-${SIDEBAR_FULL}px)`,
            transition: 'transform 0.25s ease',
          }}>
            <LogoButton showText={true} />
            <NavItems labels={true} onClick={closeDrawer} />
            <UserSection showText={true} />
          </div>
        </>
      )}
    </>
  );
}
