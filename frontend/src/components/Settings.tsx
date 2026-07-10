import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, Settings as SettingsIcon, Shield, Activity, 
  Bell, Key, Laptop, Save, Check, RefreshCw, Upload, Lock, ShieldAlert,
  Moon, Sun, HelpCircle, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';

export const Settings: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Form fields
  const [name, setName] = useState(user?.name || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Sync tab with URL
  useEffect(() => {
    if (location.pathname.includes('/security')) setActiveTab('security');
    else if (location.pathname.includes('/audit-logs')) setActiveTab('activity');
    else setActiveTab('account');
  }, [location]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'account') navigate('/settings');
    if (tab === 'security') navigate('/security');
    if (tab === 'activity') navigate('/audit-logs');
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  const tabs = [
    { id: 'account', label: 'Account Preferences', icon: <SettingsIcon size={16} /> },
    { id: 'security', label: 'Security & Auth', icon: <Shield size={16} /> },
    { id: 'activity', label: 'Audit / Activity Log', icon: <Activity size={16} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customize system settings, security access, notification triggers, and audit logs.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-1">
          <div className="glass-card p-3 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide uppercase transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Help Card */}
          <div className="hidden lg:block relative bg-gradient-to-br from-indigo-950 to-slate-950 text-white p-5 rounded-2xl overflow-hidden shadow border border-slate-800">
            <HelpCircle className="absolute -right-3 -top-3 text-white/5" size={80} />
            <h4 className="font-bold text-xs">Need Assistance?</h4>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">Visit the Help Center to view guidelines on credential rotations, API integrations, and access control settings.</p>
            <button 
              onClick={() => navigate('/help')}
              className="mt-3 text-[10px] font-bold text-brand-400 hover:text-brand-300 flex items-center gap-0.5"
            >
              Go to Help Center &rarr;
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[460px]">
          
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="glass-card p-6 space-y-6 animate-fade-in flex flex-col justify-between h-full">
              <div>
                <div className="border-b border-slate-100 dark:border-slate-700/50 pb-3 mb-6">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Account Preferences</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage details and notification rules for your session.</p>
                </div>

                <form onSubmit={handleSaveChanges} className="space-y-6">
                  {/* User Profile Summary */}
                  <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/30">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user?.name?.replace(' ', '+') || 'User'}&background=6366f1&color=fff&size=80`} 
                      alt="Avatar" 
                      className="w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{user?.name || 'Aadhi'}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        Role: {user?.role || 'Staff'}
                      </span>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Full Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="input-field w-full rounded-xl" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Department</label>
                      <input 
                        type="text" 
                        defaultValue={user?.department || 'Engineering'} 
                        className="input-field w-full rounded-xl opacity-75 cursor-not-allowed" 
                        disabled 
                      />
                    </div>
                  </div>

                  {/* Toggle Preferences */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Notifications</h3>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all cursor-pointer" onClick={() => setEmailNotifications(!emailNotifications)}>
                      <div className="flex gap-3 items-start pr-4">
                        <div className="p-2 bg-brand-50 dark:bg-brand-900/30 text-brand-500 rounded-lg">
                          <Bell size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Email Digest</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive daily notifications when new documents are uploaded or indexed.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={emailNotifications} onChange={() => {}} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-brand-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all cursor-pointer" onClick={() => setDesktopNotifications(!desktopNotifications)}>
                      <div className="flex gap-3 items-start pr-4">
                        <div className="p-2 bg-brand-50 dark:bg-brand-900/30 text-brand-500 rounded-lg">
                          <Laptop size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">System Alerts</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive system notification sound/banner on streaming errors or agent halts.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={desktopNotifications} onChange={() => {}} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-brand-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end gap-3 items-center">
                    {saveSuccess && (
                      <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                        <Check size={14} /> Changes saved successfully!
                      </span>
                    )}
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/10"
                    >
                      {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                      Save Preferences
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="glass-card p-6 space-y-6 animate-fade-in flex flex-col justify-between h-full">
              <div>
                <div className="border-b border-slate-100 dark:border-slate-700/50 pb-3 mb-6">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Security & Encryption</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Rotate keys, configure passwords, and verify authentication settings.</p>
                </div>

                <div className="space-y-6">
                  {/* Password Rotation Card */}
                  <div className="p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/10 space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Lock size={14} className="text-brand-500" /> Password Credentials
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 relative">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Current Password</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            className="input-field w-full rounded-xl pr-10" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 relative">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">New Password</label>
                        <div className="relative">
                          <input 
                            type={showNewPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            className="input-field w-full rounded-xl pr-10" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button className="btn-primary py-2 px-4 text-xs font-bold">
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* 2FA Card */}
                  <div className="p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1 max-w-lg">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ShieldAlert size={16} className="text-amber-500" /> Two-Factor Authentication (2FA)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Secure access logs with OTP generation codes dynamically checked during session logging.</p>
                    </div>
                    <button className="btn-secondary py-2 px-4 text-xs font-bold whitespace-nowrap">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="glass-card p-6 space-y-6 animate-fade-in flex flex-col justify-between h-full">
              <div>
                <div className="border-b border-slate-100 dark:border-slate-700/50 pb-3 mb-6">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Activity Log</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Chronological records of user session events and document uploads.</p>
                </div>

                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700 pt-2">
                  
                  {/* Event 1 */}
                  <div className="relative pl-7 group">
                    {/* Circle Indicator */}
                    <div className="absolute left-1.5 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-brand-500 shadow-sm" />
                    <div className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl space-y-1 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">USER_LOGIN</span>
                        <time className="font-mono">12:30 PM (Today)</time>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                        User successfully authenticated from IP address <span className="underline">192.168.1.1</span>.
                      </p>
                    </div>
                  </div>

                  {/* Event 2 */}
                  <div className="relative pl-7 group">
                    {/* Circle Indicator */}
                    <div className="absolute left-1.5 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 shadow-sm" />
                    <div className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl space-y-1 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">DOC_UPLOAD</span>
                        <time className="font-mono">Yesterday</time>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                        Uploaded <span className="font-semibold underline">Engineering_Guidelines.pdf</span>. Qdrant indexed 28 segments.
                      </p>
                    </div>
                  </div>

                  {/* Event 3 */}
                  <div className="relative pl-7 group">
                    {/* Circle Indicator */}
                    <div className="absolute left-1.5 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-amber-500 shadow-sm" />
                    <div className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl space-y-1 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">SEC_ROTATE</span>
                        <time className="font-mono">3 days ago</time>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                        API Credentials rotated for the active RAG orchestrator pipeline.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
