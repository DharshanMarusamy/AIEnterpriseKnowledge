import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, MessageSquare, BookOpen, FileText, UploadCloud, 
  BarChart2, FileBarChart, Users, Building2, ShieldCheck, 
  Bell, Bookmark, History, Cpu, FileClock, 
  Puzzle, Settings, HelpCircle, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navGroups = [
  {
    title: 'Main',
    items: [
      { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/chat', label: 'AI Assistant', icon: <MessageSquare size={20} /> },
    ]
  },
  {
    title: 'Content',
    items: [
      { path: '/knowledge', label: 'Knowledge Base', icon: <BookOpen size={20} /> },
      { path: '/documents', label: 'Documents', icon: <FileText size={20} /> },
      { path: '/upload', label: 'Upload Documents', icon: <UploadCloud size={20} /> },
      { path: '/bookmarks', label: 'Bookmarks', icon: <Bookmark size={20} /> },
      { path: '/history', label: 'Chat History', icon: <History size={20} /> },
    ]
  },
  {
    title: 'Analytics & Admin',
    items: [
      { path: '/analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
      { path: '/reports', label: 'Reports', icon: <FileBarChart size={20} /> },
      { path: '/users', label: 'Users', icon: <Users size={20} /> },
      { path: '/departments', label: 'Departments', icon: <Building2 size={20} /> },
      { path: '/roles', label: 'Roles & Permissions', icon: <ShieldCheck size={20} /> },
      { path: '/agent-monitor', label: 'Agent Monitor', icon: <Cpu size={20} /> },
      { path: '/audit-logs', label: 'Audit Logs', icon: <FileClock size={20} /> },
    ]
  },
  {
    title: 'Settings',
    items: [
      { path: '/integrations', label: 'Integrations', icon: <Puzzle size={20} /> },
      { path: '/notifications', label: 'Notifications', icon: <Bell size={20} /> },
      { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
      { path: '/help', label: 'Help Center', icon: <HelpCircle size={20} /> },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();

  return (
    <aside 
      className={`relative flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-20 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        <div className={`flex items-center gap-3 overflow-hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white shadow-md animate-float">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 truncate">AI Enterprise</span>
        </div>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${!isOpen && 'mx-auto'}`}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx} className="mb-6 px-3">
            {isOpen && (
              <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {group.title}
              </div>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                        isActive 
                          ? 'bg-gradient-to-r from-brand-50 to-purple-50 text-brand-600 dark:from-brand-900/30 dark:to-purple-900/20 dark:text-brand-300 font-medium shadow-sm border border-brand-100/50 dark:border-brand-800/30' 
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-brand-500 dark:hover:text-brand-300'
                      } ${!isOpen && 'justify-center px-0'}`
                    }
                    title={!isOpen ? item.label : undefined}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    {isOpen && <span className="truncate text-sm">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors ${!isOpen && 'justify-center px-0'}`}
          title={!isOpen ? 'Logout' : undefined}
        >
          <LogOut size={20} />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
