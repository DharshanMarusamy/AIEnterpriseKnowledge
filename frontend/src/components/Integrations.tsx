import React, { useState } from 'react';
import { 
  Puzzle, Slack, Folder, Github, Globe, Database, HelpCircle,
  Plus, Settings, Check, RefreshCw, Info, Link as LinkIcon, Power
} from 'lucide-react';

interface IntegrationItem {
  id: string;
  name: string;
  category: 'Communication' | 'Cloud Storage' | 'DevOps' | 'Database';
  description: string;
  status: 'connected' | 'disconnected';
  lastSynced?: string;
  icon: React.ReactNode;
}

export const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    {
      id: 'slack',
      name: 'Slack Bot',
      category: 'Communication',
      description: 'Query the Knowledge Assistant directly from channels and threads.',
      status: 'connected',
      lastSynced: '10 mins ago',
      icon: <Slack className="text-pink-500" size={28} />
    },
    {
      id: 'gdrive',
      name: 'Google Drive',
      category: 'Cloud Storage',
      description: 'Auto-sync and embed workspace PDFs, Docs, and Sheets.',
      status: 'disconnected',
      icon: <Folder className="text-yellow-500" size={28} />
    },
    {
      id: 'github',
      name: 'GitHub Wiki',
      category: 'DevOps',
      description: 'Import Wiki documentation and READMEs from repositories.',
      status: 'connected',
      lastSynced: '1 hour ago',
      icon: <Github className="text-slate-900 dark:text-slate-100" size={28} />
    },
    {
      id: 'postgres',
      name: 'Enterprise DB',
      category: 'Database',
      description: 'Connect internal Postgres schema definitions for structured AI querying.',
      status: 'disconnected',
      icon: <Database className="text-blue-500" size={28} />
    },
    {
      id: 'slack_enterprise',
      name: 'MS Teams',
      category: 'Communication',
      description: 'Deploy AI Knowledge bot to Microsoft Teams channels.',
      status: 'disconnected',
      icon: <Globe className="text-indigo-500" size={28} />
    }
  ]);

  const [activeTab, setActiveTab] = useState<'all' | 'connected' | 'disconnected'>('all');
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiToken, setApiToken] = useState('');

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'connected' ? 'disconnected' : 'connected';
        return {
          ...item,
          status: nextStatus,
          lastSynced: nextStatus === 'connected' ? 'Just now' : undefined
        };
      }
      return item;
    }));
  };

  const handleOpenConfig = (item: IntegrationItem) => {
    setConfiguringId(item.id);
    if (item.id === 'slack') {
      setWebhookUrl('https://hooks.slack.com/services/YOUR_WORKSPACE/YOUR_CHANNEL/YOUR_TOKEN');
      setApiToken('your-slack-bot-token-here');
    } else {
      setWebhookUrl('');
      setApiToken('');
    }
  };

  const handleSaveConfig = () => {
    if (configuringId) {
      setIntegrations(prev => prev.map(item => {
        if (item.id === configuringId) {
          return {
            ...item,
            status: 'connected',
            lastSynced: 'Just now'
          };
        }
        return item;
      }));
      setConfiguringId(null);
    }
  };

  const filteredIntegrations = integrations.filter(item => {
    if (activeTab === 'connected') return item.status === 'connected';
    if (activeTab === 'disconnected') return item.status === 'disconnected';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Puzzle className="text-brand-500 animate-pulse" /> Integrations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Connect your workspace tools to auto-sync knowledge bases and interact with the AI assistant.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 max-w-sm">
        <button 
          onClick={() => setActiveTab('all')} 
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-300'}`}
        >
          All
        </button>
        <button 
          onClick={() => setActiveTab('connected')} 
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${activeTab === 'connected' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-300'}`}
        >
          Connected
        </button>
        <button 
          onClick={() => setActiveTab('disconnected')} 
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${activeTab === 'disconnected' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-300'}`}
        >
          Not Connected
        </button>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((item) => (
          <div key={item.id} className="glass-card p-5 flex flex-col justify-between h-56 hover:scale-[1.02] transition-transform duration-200 border border-slate-200/50 dark:border-slate-800/50">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                  {item.icon}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${item.status === 'connected' ? 'bg-green-500' : 'bg-slate-400'}`} />
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                    {item.status}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed truncate-2-lines">
                {item.description}
              </p>
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {item.lastSynced ? `Synced ${item.lastSynced}` : 'Never synced'}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenConfig(item)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Configure
                </button>
                <button 
                  onClick={() => toggleConnection(item.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${item.status === 'connected' ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
                >
                  <Power size={12} /> {item.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {configuringId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings size={18} className="text-slate-400" /> Configure Integration
              </h3>
              <button 
                onClick={() => setConfiguringId(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Webhook URL</label>
                <input 
                  type="text" 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.example.com/..." 
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">API Token</label>
                <input 
                  type="password" 
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="enter api token or credential..." 
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setConfiguringId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveConfig}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl flex items-center gap-1 shadow-md shadow-brand-500/10"
              >
                <Check size={14} /> Save Connection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Quick mock components for Close/Cancel to prevent import crash
const X: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
