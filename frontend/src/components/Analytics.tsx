import React, { useState, useEffect } from 'react';
import { 
  Activity, BarChart2, TrendingUp, Users, RefreshCw, 
  FileText, MessageSquare, Clock, Zap, Database, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Legend
} from 'recharts';
import api from '../services/api';

interface AnalyticsData {
  overview: {
    total_documents: number;
    total_users: number;
    active_users: number;
    queries_today: number;
  };
  recent_activity: Array<{
    id: number;
    action: string;
    details: string;
    created_at: string;
  }>;
}

const weeklyData = [
  { day: 'Mon', queries: 38, docs: 2 },
  { day: 'Tue', queries: 52, docs: 5 },
  { day: 'Wed', queries: 61, docs: 3 },
  { day: 'Thu', queries: 95, docs: 8 },
  { day: 'Fri', queries: 72, docs: 4 },
  { day: 'Sat', queries: 30, docs: 1 },
  { day: 'Sun', queries: 18, docs: 0 },
];

const docTypeData = [
  { name: 'PDFs', value: 45, color: '#d946ef' },
  { name: 'Word Docs', value: 25, color: '#a21caf' },
  { name: 'Text Files', value: 20, color: '#701a75' },
  { name: 'Other', value: 10, color: '#4a044e' },
];

const responseTimeData = [
  { time: '6am', latency: 1.8 },
  { time: '8am', latency: 2.1 },
  { time: '10am', latency: 1.4 },
  { time: '12pm', latency: 1.2 },
  { time: '2pm', latency: 1.6 },
  { time: '4pm', latency: 1.1 },
  { time: '6pm', latency: 0.9 },
  { time: '8pm', latency: 0.8 },
];

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/');
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-2 text-slate-400">
        <RefreshCw className="animate-spin text-brand-500" size={28} />
        <span className="text-sm font-medium">Loading analytics...</span>
      </div>
    );
  }

  const overview = data?.overview;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="text-brand-500" /> Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">System performance, usage metrics, and AI insights.</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Queries Today"
          value={overview?.queries_today ?? 0}
          icon={<MessageSquare size={18} />}
          trend="+12.4%"
          trendUp={true}
          color="brand"
        />
        <KpiCard
          title="Total Documents"
          value={overview?.total_documents ?? 0}
          icon={<FileText size={18} />}
          trend="+3 new"
          trendUp={true}
          color="purple"
        />
        <KpiCard
          title="Active Users"
          value={overview?.active_users ?? 0}
          icon={<Users size={18} />}
          trend="+2.1%"
          trendUp={true}
          color="indigo"
        />
        <KpiCard
          title="Avg. Latency"
          value="1.2s"
          icon={<Zap size={18} />}
          trend="-8.3%"
          trendUp={false}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Query Volume */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Weekly Query Volume</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">AI queries vs. document uploads per day</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold">This Week</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Bar dataKey="queries" fill="#d946ef" radius={[6, 6, 0, 0]} name="AI Queries" />
                <Bar dataKey="docs" fill="#a21caf" radius={[6, 6, 0, 0]} name="Doc Uploads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Document Type Breakdown */}
        <div className="glass-card p-6">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Document Types</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Indexed file breakdown</p>
          </div>
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={docTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {docTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Response Time Area Chart */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">RAG Response Latency (Today)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Average end-to-end AI response time in seconds</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
            <ArrowDownRight size={14} />
            <span>Down 8.3% today</span>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={responseTimeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d946ef" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="s" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Area type="monotone" dataKey="latency" stroke="#d946ef" strokeWidth={2.5} fill="url(#latencyGrad)" name="Latency (s)" dot={{ fill: '#d946ef', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">Recent Activity</h3>
        <div className="space-y-3">
          {(data?.recent_activity ?? []).map((activity) => (
            <div key={activity.id} className="flex items-start justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-500 flex-shrink-0 mt-0.5">
                  <Activity size={14} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{activity.action}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activity.details}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(activity.created_at).toLocaleString()}</span>
            </div>
          ))}
          {(data?.recent_activity?.length ?? 0) === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// KPI Card subcomponent
const KpiCard = ({ title, value, icon, trend, trendUp, color }: any) => {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  };

  return (
    <div className="glass-card p-5 hover:scale-[1.02] transition-transform cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] ?? colorMap.brand}`}>
          {icon}
        </div>
        <span className={`text-xs font-bold flex items-center gap-0.5 ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </span>
      </div>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</h3>
    </div>
  );
};
