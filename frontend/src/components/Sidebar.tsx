import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  {
    to: '/',
    label: 'Transactions',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="14" height="2" rx="1" fill="currentColor"/>
        <rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor"/>
        <rect x="1" y="12" width="9" height="2" rx="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="9" width="3" height="6" rx="1" fill="currentColor"/>
        <rect x="6" y="5" width="3" height="10" rx="1" fill="currentColor"/>
        <rect x="11" y="1" width="3" height="14" rx="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    to: '/categories',
    label: 'Categories',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    to: '/events',
    label: 'Events',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <rect x="5" y="1" width="1.5" height="4" rx=".75" fill="currentColor"/>
        <rect x="9.5" y="1" width="1.5" height="4" rx=".75" fill="currentColor"/>
        <rect x="1" y="7" width="14" height="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    to: '/import-export',
    label: 'Import / Export',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1v10M4 7l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <div style={{
      width: 220, minWidth: 220, height: '100vh',
      background: '#141414', display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, background: '#D1FF19', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 18, color: '#111', flexShrink: 0,
        }}>B</div>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Budget</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 10px' }}>
        {NAV.map(item => {
          const active = isActive(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
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
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, color: active ? '#111' : '#888' }}>
                  {item.label}
                </span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#252525',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#D1FF19', fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>
          {(user?.name || user?.email || 'U')[0].toUpperCase()}
        </div>
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
      </div>
    </div>
  );
}
