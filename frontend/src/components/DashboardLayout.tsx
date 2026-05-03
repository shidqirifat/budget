import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return mobile;
}

export default function DashboardLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [topbarHeight, setTopbarHeight] = useState(0);
  const isMobile = useIsMobile();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar onWidthChange={setSidebarWidth} onTopbarHeight={setTopbarHeight} />
      <main style={{
        marginLeft: sidebarWidth, paddingTop: topbarHeight, flex: 1,
        overflow: isMobile ? 'auto' : 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'margin-left 0.2s ease',
      }}>
        <Outlet />
      </main>
    </div>
  );
}
