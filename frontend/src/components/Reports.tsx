import React, { useState, useEffect } from 'react';
import {
  FileText, Download, BarChart2, Users, Clock, Shield, 
  RefreshCw, ChevronDown, Check, TrendingUp, TrendingDown,
  Database, Activity, Cpu, AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../services/api';

// Mock time-series data for reports
const monthlyQueryData = [
  { month: 'Jan', queries: 120, users: 8 },
  { month: 'Feb', queries: 180, users: 10 },
  { month: 'Mar', queries: 240, users: 12 },
  { month: 'Apr', queries: 195, users: 11 },
  { month: 'May', queries: 310, users: 15 },
  { month: 'Jun', queries: 285, users: 14 },
  { month: 'Jul', queries: 420, users: 18 },
];

const docStatusData = [
  { name: 'Indexed', value: 72, color: '#d946ef' },
  { name: 'Processing', value: 12, color: '#a21caf' },
  { name: 'Failed', value: 5, color: '#ef4444' },
  { name: 'Pending', value: 11, color: '#f59e0b' },
];

const userActivityData = [
  { week: 'W1', logins: 32, queries: 95, uploads: 8 },
  { week: 'W2', logins: 41, queries: 130, uploads: 12 },
  { week: 'W3', logins: 29, queries: 88, uploads: 6 },
  { week: 'W4', logins: 55, queries: 175, uploads: 15 },
];

const REPORT_TYPES = [
  { id: 'system', label: 'System Overview', icon: <BarChart2 size={15} /> },
  { id: 'documents', label: 'Document Report', icon: <FileText size={15} /> },
  { id: 'users', label: 'User Activity', icon: <Users size={15} /> },
  { id: 'security', label: 'Security Audit', icon: <Shield size={15} /> },
];

export const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState('system');
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/');
        setOverview(res.data.overview);
      } catch (err) {
        console.error('Failed to load report data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1800);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="text-brand-500" /> Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Detailed reports on system usage, documents, and security compliance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-3 text-slate-400 pointer-events-none" />
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {exporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 flex-wrap">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeReport === r.id
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300 hover:text-brand-600'
            }`}
          >
            {r.icon}
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-2 text-slate-400">
          <RefreshCw className="animate-spin text-brand-500" size={28} />
          <span className="text-sm">Loading report data...</span>
        </div>
      ) : (
        <>
          {/* SYSTEM OVERVIEW REPORT */}
          {activeReport === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ReportMetricCard title="Total Documents" value={overview?.total_documents ?? 56} icon={<FileText size={18} />} delta="+3 this week" positive={true} />
                <ReportMetricCard title="AI Queries" value={overview?.queries_today ?? 128} icon={<Activity size={18} />} delta="+22% vs last week" positive={true} />
                <ReportMetricCard title="Users" value={overview?.total_users ?? 8} icon={<Users size={18} />} delta="+1 new user" positive={true} />
                <ReportMetricCard title="Avg Latency" value="1.2s" icon={<Cpu size={18} />} delta="-0.3s improved" positive={true} />
              </div>

              <div className="glass-card p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Monthly Query Volume & Users</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Total AI queries and active user counts per month</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyQueryData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="queryGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a21caf" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a21caf" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
                      <Area type="monotone" dataKey="queries" stroke="#d946ef" strokeWidth={2.5} fill="url(#queryGrad)" name="AI Queries" />
                      <Area type="monotone" dataKey="users" stroke="#a21caf" strokeWidth={2} fill="url(#userGrad)" name="Active Users" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* System Health Summary */}
              <div className="glass-card p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-5">System Health Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Qdrant Vector DB', status: 'Operational', latency: '18ms', ok: true },
                    { name: 'PostgreSQL', status: 'Operational', latency: '4ms', ok: true },
                    { name: 'Redis Cache', status: 'Operational', latency: '2ms', ok: true },
                    { name: 'AI Orchestrator', status: 'Operational', latency: '110ms', ok: true },
                    { name: 'FastAPI Backend', status: 'Operational', latency: '12ms', ok: true },
                    { name: 'Embedding Model', status: 'Degraded', latency: '340ms', ok: false },
                  ].map((svc, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${svc.ok ? 'border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/10' : 'border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${svc.ok ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{svc.name}</p>
                          <p className={`text-[10px] font-medium ${svc.ok ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>{svc.status}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{svc.latency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT REPORT */}
          {activeReport === 'documents' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">Document Indexing Status</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Current processing state of all documents</p>
                  <div className="h-56 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={docStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                          {docStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-5">Indexing Pipeline Stats</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Avg. Chunk Size', value: '512 tokens', bar: 60 },
                      { label: 'Embedding Dimension', value: '768 dims', bar: 80 },
                      { label: 'Vector Store Fill', value: '72%', bar: 72 },
                      { label: 'Cache Hit Rate', value: '42.5%', bar: 43 },
                      { label: 'RAG Accuracy (Est.)', value: '98.2%', bar: 98 },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                          <span className="text-slate-900 dark:text-white font-bold">{item.value}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-full" style={{ width: `${item.bar}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Document Processing Log */}
              <div className="glass-card p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-5">Recent Document Activity</h3>
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="pb-3 font-semibold">Document</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Uploaded By</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { name: 'Benefits_Overview.pdf', type: 'PDF', user: 'Test User', date: '02-02-2026', ok: true },
                      { name: 'Engineering_Guidelines.pdf', type: 'PDF', user: 'Admin', date: '02-03-2026', ok: true },
                      { name: 'Security_Policy.pdf', type: 'PDF', user: 'System', date: '02-04-2026', ok: false },
                      { name: 'IT_Network_Report.docx', type: 'Word', user: 'Admin', date: '02-05-2026', ok: true },
                      { name: 'Q2_Financial_Summary.xlsx', type: 'Excel', user: 'Test User', date: '02-06-2026', ok: true },
                    ].map((doc, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{doc.name}</td>
                        <td className="py-3 text-slate-500">{doc.type}</td>
                        <td className="py-3 text-slate-500">{doc.user}</td>
                        <td className="py-3 text-slate-400 font-mono">{doc.date}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${doc.ok ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'}`}>
                            {doc.ok ? 'Indexed' : 'Processing'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USER ACTIVITY REPORT */}
          {activeReport === 'users' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Weekly User Activity</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Logins, queries, and uploads per week</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userActivityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
                      <Bar dataKey="logins" fill="#d946ef" radius={[5, 5, 0, 0]} name="Logins" />
                      <Bar dataKey="queries" fill="#a21caf" radius={[5, 5, 0, 0]} name="Queries" />
                      <Bar dataKey="uploads" fill="#701a75" radius={[5, 5, 0, 0]} name="Uploads" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-5">User Summary</h3>
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="pb-3 font-semibold">User</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Queries</th>
                      <th className="pb-3 font-semibold">Uploads</th>
                      <th className="pb-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { name: 'Test User', role: 'Admin', queries: 87, uploads: 14, active: true },
                      { name: 'System', role: 'System', queries: 41, uploads: 7, active: true },
                      { name: 'Guest', role: 'Viewer', queries: 12, uploads: 0, active: false },
                    ].map((user, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{user.name}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{user.role}</span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400 font-mono">{user.queries}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400 font-mono">{user.uploads}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${user.active ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECURITY AUDIT REPORT */}
          {activeReport === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ReportMetricCard title="Security Score" value="94/100" icon={<Shield size={18} />} delta="Excellent" positive={true} />
                <ReportMetricCard title="Failed Logins" value="2" icon={<AlertTriangle size={18} />} delta="Last 7 days" positive={false} />
                <ReportMetricCard title="Data Encrypted" value="100%" icon={<Database size={18} />} delta="All docs encrypted" positive={true} />
              </div>

              <div className="glass-card p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-5">Security Compliance Checklist</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: 'Data Encryption at Rest', ok: true },
                    { label: 'JWT Token Authentication', ok: true },
                    { label: 'Role-Based Access Control (RBAC)', ok: true },
                    { label: 'API Rate Limiting', ok: true },
                    { label: 'SSL/TLS Connection', ok: true },
                    { label: 'Audit Log Tracking', ok: true },
                    { label: 'Two-Factor Authentication (2FA)', ok: false },
                    { label: 'Automated Backup Verification', ok: false },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium ${item.ok ? 'border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/10 text-green-700 dark:text-green-400' : 'border-amber-200 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.ok ? 'bg-green-500' : 'bg-amber-400'}`}>
                        {item.ok ? <Check size={12} className="text-white" /> : <AlertTriangle size={10} className="text-white" />}
                      </div>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-5">Audit Log (Recent)</h3>
                <div className="space-y-2">
                  {[
                    { time: '14:32:01', event: 'User login successful', user: 'testuser@example.com', ok: true },
                    { time: '14:18:45', event: 'Document uploaded', user: 'testuser@example.com', ok: true },
                    { time: '13:55:22', event: 'Failed login attempt', user: 'unknown@test.com', ok: false },
                    { time: '13:40:10', event: 'RAG query executed', user: 'testuser@example.com', ok: true },
                    { time: '13:01:05', event: 'Settings updated', user: 'testuser@example.com', ok: true },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <span className="text-[10px] font-mono text-slate-400 w-16 flex-shrink-0">{log.time}</span>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${log.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-slate-700 dark:text-slate-300 flex-1">{log.event}</span>
                      <span className="text-[10px] text-slate-400">{log.user}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Metric Card subcomponent
const ReportMetricCard = ({ title, value, icon, delta, positive }: any) => (
  <div className="glass-card p-5">
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-500">
        {icon}
      </div>
      <span className={`text-xs font-bold flex items-center gap-0.5 ${positive ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
        {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {delta}
      </span>
    </div>
    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</h3>
  </div>
);
