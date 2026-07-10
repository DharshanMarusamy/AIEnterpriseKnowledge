import React, { useState } from 'react';
import { 
  Bell, Check, Info, AlertTriangle, AlertCircle, 
  Trash2, MailOpen, ShieldCheck, Cpu, RefreshCw
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  category: 'System' | 'Database' | 'Orchestrator';
}

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'success',
      title: 'Qdrant Vector Indexing Complete',
      message: 'Successfully chunked, embedded, and mapped Engineering_Guidelines.pdf. 28 nodes loaded to vector database.',
      time: '15 mins ago',
      isRead: false,
      category: 'Database'
    },
    {
      id: '2',
      type: 'info',
      title: 'Agent Monitor Toggle Updated',
      message: 'Master control state updated to ACTIVE by Test User. RAG retrieval pipeline is fully enabled.',
      time: '1 hour ago',
      isRead: false,
      category: 'Orchestrator'
    },
    {
      id: '3',
      type: 'warning',
      title: 'RAG Pipeline Latency Warning',
      message: 'Average response stream execution time reached threshold (4.2s on recent chat query).',
      time: '3 hours ago',
      isRead: false,
      category: 'System'
    },
    {
      id: '4',
      type: 'info',
      title: 'PostgreSQL Database Synced',
      message: 'Database connection verified. Schema validation matches the latest model definitions.',
      time: 'Yesterday',
      isRead: true,
      category: 'Database'
    },
    {
      id: '5',
      type: 'success',
      title: 'New Account Created',
      message: 'New staff member registration successful under the Engineering department.',
      time: '2 days ago',
      isRead: true,
      category: 'System'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <div className="p-2 bg-green-50 dark:bg-green-950/30 text-green-500 rounded-xl"><ShieldCheck size={18} /></div>;
      case 'warning':
        return <div className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-xl"><AlertTriangle size={18} /></div>;
      case 'error':
        return <div className="p-2 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-xl"><AlertCircle size={18} /></div>;
      default:
        return <div className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-xl"><Info size={18} /></div>;
    }
  };

  const filtered = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="text-brand-500" /> Notifications
            {unreadCount > 0 && (
              <span className="ml-1 text-xs px-2.5 py-0.5 rounded-full font-bold bg-brand-500 text-white animate-pulse">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit warnings, DB updates, and microservices latency alerts.</p>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button 
              onClick={markAllAsRead}
              className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
            >
              <MailOpen size={14} /> Mark all read
            </button>
            <button 
              onClick={clearAll}
              className="px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl flex items-center gap-1 transition-colors"
            >
              <Trash2 size={14} /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 max-w-[200px]">
        <button 
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-300'}`}
        >
          All
        </button>
        <button 
          onClick={() => setActiveTab('unread')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${activeTab === 'unread' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-300'}`}
        >
          Unread
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filtered.map((n) => (
          <div 
            key={n.id}
            onClick={() => !n.isRead && markAsRead(n.id)}
            className={`glass-card p-4 flex gap-4 items-start relative group transition-all duration-200 border ${
              n.isRead 
                ? 'opacity-70 hover:opacity-100 border-slate-200/50 dark:border-slate-800/50' 
                : 'border-brand-200 dark:border-brand-800/40 bg-brand-50/10 dark:bg-brand-950/5 shadow-md shadow-brand-500/5'
            }`}
          >
            {/* Unread dot indicator */}
            {!n.isRead && (
              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-500" />
            )}

            {getIcon(n.type)}

            <div className="flex-1 space-y-1 pr-6">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h3>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                  {n.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-4">
                {n.message}
              </p>
              <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1">
                {n.time}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!n.isRead && (
                <button 
                  onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                  title="Mark as read"
                >
                  <Check size={14} />
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            No notifications found in this category.
          </div>
        )}
      </div>

    </div>
  );
};
