import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-slate-50/50 dark:bg-slate-900/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
