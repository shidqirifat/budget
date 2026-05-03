import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [topbarHeight, setTopbarHeight] = useState(0);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar onWidthChange={setSidebarWidth} onTopbarHeight={setTopbarHeight} />
      <main style={{
        marginLeft: sidebarWidth, paddingTop: topbarHeight, flex: 1,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'margin-left 0.2s ease',
      }}>
        <Outlet />
      </main>
    </div>
  );
}
