import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Sun, Moon, Bell, Menu, User as UserIcon, 
  Settings, Activity, LogOut, ChevronDown, Globe, Shield
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import api from '../services/api';

interface TopbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{documents: any[], chats: any[]}>({ documents: [], chats: [] });
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const mockNotifications = [
    { id: 1, title: 'System Update', message: 'Vector DB indexing completed successfully.', time: '10m ago', unread: true },
    { id: 2, title: 'New Document', message: 'HR_Policy_2026.pdf was uploaded.', time: '1h ago', unread: true },
    { id: 3, title: 'Security Alert', message: 'Multiple failed logins detected.', time: '2h ago', unread: false },
  ];

  // Initialize theme
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchResults({ documents: [], chats: [] });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults({ documents: [], chats: [] });
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/search?q=${searchQuery}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const [aiStatus, setAiStatus] = useState(true);

  useEffect(() => {
    // Fetch initial AI status
    const fetchAiStatus = async () => {
      try {
        const res = await api.get('/health/ai');
        setAiStatus(res.data.is_active);
      } catch (err) {
        console.error("Failed to fetch AI status", err);
      }
    };
    fetchAiStatus();
  }, []);

  const toggleAiStatus = async () => {
    try {
      const newStatus = !aiStatus;
      await api.post('/health/ai', { is_active: newStatus });
      setAiStatus(newStatus);
    } catch (err) {
      console.error("Failed to update AI status", err);
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-white/40 dark:border-slate-800/60 z-10 sticky top-0 shadow-sm">
      <div className="flex items-center flex-1 gap-4">
        {/* Mobile menu toggle (only visible on small screens when sidebar is hidden) */}
        {!isSidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Global Search */}
        <div className="max-w-md w-full relative hidden sm:block" ref={searchRef}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all dark:text-slate-200 placeholder:text-slate-400"
            placeholder="Search across documents, chats, and insights..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-block px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-400 font-mono">
              ⌘ K
            </kbd>
          </div>
          
          {/* Search Results Dropdown */}
          {(searchResults.documents.length > 0 || searchResults.chats.length > 0) && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 max-h-96 overflow-y-auto z-50 animate-fade-in">
              {searchResults.documents.length > 0 && (
                <div className="mb-2">
                  <h4 className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase">Documents</h4>
                  {searchResults.documents.map(doc => (
                    <Link key={doc.id} to="/knowledge" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => setSearchQuery('')}>
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{doc.title}</span>
                    </Link>
                  ))}
                </div>
              )}
              {searchResults.chats.length > 0 && (
                <div>
                  <h4 className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase">Chats</h4>
                  {searchResults.chats.map(chat => (
                    <Link key={chat.id} to="/chat" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => setSearchQuery('')}>
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{chat.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* AI Status Indicator */}
        <button 
          onClick={toggleAiStatus}
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
            aiStatus 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${aiStatus ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
          <span className={`text-xs font-medium ${aiStatus ? 'text-green-700 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {aiStatus ? 'AI Active' : 'AI Offline'}
          </span>
        </button>

        {/* Language Switcher */}
        <button className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hidden sm:block">
          <Globe size={18} />
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-fade-in origin-top-right">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Notifications</h3>
                <span className="text-xs text-brand-600 dark:text-brand-400 cursor-pointer">Mark all as read</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.map(notif => (
                  <div key={notif.id} className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${notif.unread ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm font-medium ${notif.unread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{notif.title}</p>
                      <span className="text-[10px] text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{notif.message}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 text-center border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <span className="text-xs font-medium text-brand-600 dark:text-brand-400">View all notifications</span>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          >
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.name?.replace(' ', '+') || 'Admin'}&background=6366f1&color=fff&bold=true`} 
              alt="Profile" 
              className="w-8 h-8 rounded-full shadow-sm"
            />
            <div className="hidden md:block text-left mr-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none mb-0.5">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-none">{user?.role || 'Administrator'}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 animate-fade-in origin-top-right">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 mb-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
              
              <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                <UserIcon size={16} className="text-slate-400" /> My Profile
              </Link>
              <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                <Settings size={16} className="text-slate-400" /> Account Settings
              </Link>
              <Link to="/security" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                <Shield size={16} className="text-slate-400" /> Security
              </Link>
              <Link to="/audit-logs" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                <Activity size={16} className="text-slate-400" /> Activity Log
              </Link>

              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
              
              <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <span>Switch Organization</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-600">Pro</span>
              </button>

              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>

              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }} 
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
