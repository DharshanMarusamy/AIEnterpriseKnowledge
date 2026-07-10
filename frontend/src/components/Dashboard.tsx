import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, ArrowDownRight, MoreHorizontal, X, Plus,
  FileText, MessageSquare, Users, Clock, ShieldCheck, Database, 
  Cpu, Activity, RefreshCw, BarChart2, Check, HelpCircle, CheckCircle
} from 'lucide-react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../store/AuthContext';
import api from '../services/api';

// Chart Data (Fuchsia capsule bars representing weekly RAG query volume)
const initialChartData = [
  { name: 'Mon', count: 42 },
  { name: 'Tue', count: 85 },
  { name: 'Wed', count: 64 },
  { name: 'Thu', count: 128 },
  { name: 'Fri', count: 95 },
  { name: 'Sat', count: 50 },
  { name: 'Sun', count: 32 },
  { name: 'Mon', count: 75 },
  { name: 'Tue', count: 110 },
  { name: 'Wed', count: 90 },
  { name: 'Thu', count: 135 },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDocs: 56,
    activeUsers: 3,
    queriesToday: 12,
    avgLatency: '1.2s'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthAndStats = async () => {
      try {
        const [healthRes, analyticsRes] = await Promise.all([
          api.get('/health/ai'),
          api.get('/analytics/')
        ]);
        
        setHealthData(healthRes.data.services || []);
        
        if (analyticsRes.data) {
          const overview = analyticsRes.data.overview;
          setStats({
            totalDocs: overview.total_documents || 56,
            activeUsers: overview.active_users || 3,
            queriesToday: overview.queries_today || 12,
            avgLatency: '1.2s' // mock latency
          });
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthAndStats();
    const interval = setInterval(fetchHealthAndStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0b0c10] text-[#e0e0e0] font-sans p-6 rounded-[2rem] border border-[#1f222e] shadow-2xl min-h-[calc(100vh-4rem)] space-y-6 animate-fade-in">
      
      {/* Main Grid Layout matching mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CENTER SECTION: RAG Stats, Query Volume Chart, Indexing Status, Processing Table (Col Span: 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Info Header */}
          <div className="flex justify-between items-center border-b border-[#1f222e] pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white uppercase">AI Knowledge Dashboard</h2>
              <span className="text-[10px] text-zinc-500 font-semibold tracking-wider">Enterprise RAG & AI Agent Statistics</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#161720] border border-[#222431] px-3 py-1.5 rounded-xl text-xs text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" />
              <span>Orchestrator: Active</span>
            </div>
          </div>

          {/* Top 4 Stat Cards Row (Aligned with Mockup) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="file" title="Total Documents" value={stats.totalDocs.toString()} trend="+12.45%" trendUp={true} />
            <StatCard icon="chat" title="AI Queries Today" value={stats.queriesToday.toString()} trend="+4.82%" trendUp={true} />
            <StatCard icon="users" title="Active Users" value={stats.activeUsers.toString()} trend="+2.10%" trendUp={true} />
            <StatCard icon="clock" title="Avg. Latency" value={stats.avgLatency} trend="-8.46%" trendUp={false} />
          </div>

          {/* RAG Query Volume Bar Chart */}
          <div className="bg-[#12131a] rounded-[1.5rem] border border-[#1f222e] p-5 relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-sm tracking-wide text-white uppercase">RAG Query Volume</h3>
                <span className="text-[10px] text-zinc-500 font-medium">Daily inference requests volume</span>
              </div>
              <div className="flex bg-[#0b0c10] border border-[#222431] p-1 rounded-xl text-[10px] font-bold text-zinc-400">
                <button className="px-3 py-1.5 hover:text-white rounded-lg">Months</button>
                <button className="px-3 py-1.5 bg-brand-500 text-white rounded-lg">Years</button>
              </div>
            </div>

            {/* Float Tooltip Pill */}
            <div className="flex justify-center mb-4">
              <div className="bg-[#4a044e]/50 border border-[#d946ef]/30 px-4 py-1.5 rounded-xl text-center shadow-lg shadow-brand-500/10">
                <span className="text-[8px] text-brand-400 font-bold uppercase tracking-widest block">Active LLM Load</span>
                <span className="text-base font-extrabold text-white">128 Queries/hr</span>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={initialChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f222e" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717a' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717a' }} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#161720', border: '1px solid #222431', borderRadius: '12px', fontSize: 10 }} />
                  <Bar dataKey="count" fill="#d946ef" radius={[8, 8, 8, 8]}>
                    {initialChartData.map((entry, index) => {
                      const isHighest = entry.count === Math.max(...initialChartData.map(d => d.count));
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isHighest ? '#d946ef' : '#7e22ce'} 
                          opacity={isHighest ? 1 : 0.55} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom 4 Stat Cards Row (Specific to RAG system parameters) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="layers" title="Indexed Chunks" value="1,420" trend="+15.2%" trendUp={true} />
            <StatCard icon="database" title="Vector Points" value="1,420" trend="+15.2%" trendUp={true} />
            <StatCard icon="accuracy" title="RAG Accuracy" value="98.2%" trend="+0.4%" trendUp={true} />
            <StatCard icon="cpu" title="Cache Hit Rate" value="42.5%" trend="+5.6%" trendUp={true} />
          </div>

          {/* Bottom Table: Document Processing Log */}
          <div className="bg-[#12131a] rounded-[1.5rem] border border-[#1f222e] p-5 overflow-hidden">
            <h3 className="font-bold text-sm tracking-wide text-white uppercase mb-4">Document Processing Pipeline</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1f222e] text-zinc-500">
                    <th className="pb-3 font-semibold">Document Name</th>
                    <th className="pb-3 font-semibold">Uploader</th>
                    <th className="pb-3 font-semibold">File Size</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f222e]/40">
                  <TableRow stage="Benefits_Overview.pdf" owner="Test User" project="1.2 MB" date="02-02-2026" status="Processed" />
                  <TableRow stage="Engineering_Guidelines.pdf" owner="Admin" project="2.4 MB" date="02-03-2026" status="Processed" />
                  <TableRow stage="Security_Policy.pdf" owner="System" project="850 KB" date="02-04-2026" status="Indexing" />
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Profile details, Quick lists, vertical Embedding Latency chart, compliance circular gauge (Col Span: 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* User Profile Card */}
          <div className="bg-[#12131a] rounded-[1.5rem] border border-[#1f222e] p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name?.replace(' ', '+') || 'Admin+User'}&background=d946ef&color=0b0c10&size=80`} 
                alt="Profile" 
                className="w-10 h-10 rounded-xl object-cover shadow-sm border border-zinc-800"
              />
              <div>
                <h4 className="font-bold text-sm text-white">{user?.name || 'Admin User'}</h4>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase">{user?.role || 'RAG Manager'}</span>
              </div>
            </div>
            <button className="p-1.5 bg-[#0b0c10] border border-[#222431] rounded-xl text-zinc-400 hover:text-white">
              <MoreHorizontal size={14} />
            </button>
          </div>

          {/* Quick RAG Metrics Lists */}
          <div className="space-y-3">
            {/* Connected Integrations */}
            <div className="bg-[#12131a] rounded-[1.2rem] border border-[#1f222e] p-4 flex justify-between items-center hover:scale-[1.01] transition-transform cursor-pointer">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Connected Integrations</span>
                <h4 className="text-xl font-extrabold text-white mt-1">2 Active</h4>
              </div>
              <div className="p-1.5 bg-[#0b0c10] border border-[#222431] rounded-lg text-zinc-400">
                <ArrowUpRight size={14} />
              </div>
            </div>

            {/* Security Backup status (Fuchsia Card) */}
            <div className="bg-gradient-to-r from-brand-500 to-purple-600 rounded-[1.2rem] p-4 flex justify-between items-center text-white hover:scale-[1.01] transition-transform cursor-pointer shadow-lg shadow-brand-500/10">
              <div>
                <span className="text-[10px] text-brand-200 font-bold uppercase tracking-wider">System Backup Status</span>
                <h4 className="text-xl font-black mt-1">Synced & Secure</h4>
              </div>
              <div className="p-1.5 bg-zinc-950 rounded-lg text-white">
                <ArrowUpRight size={14} />
              </div>
            </div>

            {/* Unread system alerts */}
            <div className="bg-[#12131a] rounded-[1.2rem] border border-[#1f222e] p-4 flex justify-between items-center hover:scale-[1.01] transition-transform cursor-pointer">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">System Warnings</span>
                <h4 className="text-xl font-extrabold text-white mt-1">3 Active</h4>
              </div>
              <div className="p-1.5 bg-[#0b0c10] border border-[#222431] rounded-lg text-zinc-400">
                <ArrowUpRight size={14} />
              </div>
            </div>
          </div>

          {/* Analytics Vertical Bar Indicators: Embedding latency pipeline */}
          <div className="bg-[#12131a] rounded-[1.5rem] border border-[#1f222e] p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">Embedding Latency</h3>
              <button className="text-zinc-500 hover:text-white"><MoreHorizontal size={14} /></button>
            </div>

            <div className="grid grid-cols-3 gap-3 h-28 items-end justify-items-center">
              {/* Chunking */}
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-6 bg-zinc-800 rounded-lg h-[45%] flex items-center justify-center text-[10px] text-zinc-500 font-bold">12ms</div>
                <span className="text-[9px] text-zinc-500 font-semibold">Chunking</span>
              </div>
              {/* Vectorization (Active) */}
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-6 bg-[#d946ef] text-white rounded-lg h-[90%] flex items-center justify-center text-[10px] font-black shadow-lg shadow-brand-500/20">110ms</div>
                <span className="text-[9px] text-white font-bold">Embed</span>
              </div>
              {/* Vector DB insert */}
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-6 bg-zinc-800 rounded-lg h-[65%] flex items-center justify-center text-[10px] text-zinc-500 font-bold">42ms</div>
                <span className="text-[9px] text-zinc-500 font-semibold">Qdrant</span>
              </div>
            </div>

            {/* Horizontal Day Calendar list */}
            <div className="flex justify-between items-center pt-2 border-t border-[#1f222e]/40">
              <DayItem day="Mo" num="12" />
              <DayItem day="Tu" num="13" active={true} />
              <DayItem day="We" num="14" />
              <DayItem day="Th" num="15" />
              <DayItem day="Fr" num="16" />
              <DayItem day="Sa" num="17" />
              <DayItem day="Su" num="18" />
            </div>
          </div>

          {/* Audit Radial Ring Progress: RAG Data Privacy Audit */}
          <div className="bg-[#12131a] rounded-[1.5rem] border border-[#1f222e] p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">Privacy Audit</h3>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[8px] text-zinc-400 font-bold uppercase">Active status</span>
                <button className="text-zinc-500 hover:text-white"><X size={12} /></button>
              </div>
            </div>

            <div className="flex justify-center items-center py-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#1f2937" strokeWidth="9" fill="transparent" />
                  <circle cx="50" cy="50" r="38" stroke="#d946ef" strokeWidth="9" fill="transparent" strokeDasharray="238.7" strokeDashoffset="0" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-white">100%</span>
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-brand-400">Secure</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#1f222e]/40">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-zinc-500 uppercase tracking-wider">Indexed Security share</span>
                <span className="text-brand-400">100%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Microservices Health Checklist */}
          <div className="bg-[#12131a] rounded-[1.5rem] border border-[#1f222e] p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Microservice Status</h3>
            <div className="grid grid-cols-2 gap-3">
              {healthData.length > 0 ? (
                healthData.map((item, idx) => {
                  const isHealthy = item.status === 'healthy';
                  return (
                    <div key={idx} className="p-2.5 rounded-xl border border-zinc-800 bg-[#0b0c10] flex flex-col justify-between h-14 animate-fade-in">
                      <span className="text-[10px] text-zinc-400 font-bold truncate">{item.name}</span>
                      <div className="flex justify-between items-center text-[9px] font-semibold">
                        <span className={isHealthy ? 'text-brand-400' : 'text-amber-500'}>
                          {isHealthy ? 'Online' : 'Warning'}
                        </span>
                        <span className="text-zinc-500 font-mono">{item.latency}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center text-[10px] text-zinc-500 py-2 flex flex-col items-center justify-center gap-1.5">
                  <RefreshCw className="animate-spin text-brand-400" size={14} />
                  <span>Loading services...</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

// StatCard Sub-component
const StatCard = ({ icon, title, value, trend, trendUp }: any) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileText size={16} />;
      case 'chat':
        return <MessageSquare size={16} />;
      case 'users':
        return <Users size={16} />;
      case 'clock':
        return <Clock size={16} />;
      case 'layers':
        return <Database size={16} />;
      case 'database':
        return <Database size={16} />;
      case 'accuracy':
        return <CheckCircle size={16} />;
      case 'cpu':
        return <Cpu size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  return (
    <div className="bg-[#12131a] border border-[#1f222e]/80 p-4.5 rounded-[1.2rem] hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between min-h-[110px]">
      <div className="flex justify-between items-center mb-3">
        <div className="p-2 rounded-lg bg-[#0b0c10] border border-[#222431] text-brand-400">
          {getIcon(icon)}
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-brand-950/40 text-brand-400 border border-brand-500/25' : 'bg-red-950/40 text-red-400 border border-red-500/25'}`}>
          {trend}
        </span>
      </div>
      <div>
        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide">{title}</span>
        <h4 className="text-xl font-extrabold text-white mt-0.5">{value}</h4>
      </div>
    </div>
  );
};

// TableRow Subcomponent
const TableRow = ({ stage, owner, project, date, status }: any) => {
  const getStatusStyle = (s: string) => {
    if (s === 'Processed') return 'bg-brand-950/30 text-brand-400 border border-brand-500/20';
    if (s === 'Indexing') return 'bg-amber-950/30 text-amber-400 border border-amber-500/20';
    return 'bg-zinc-800 text-zinc-300';
  };

  return (
    <tr className="hover:bg-[#161720]/40 transition-colors">
      <td className="py-3 font-semibold text-white truncate max-w-[150px]">{stage}</td>
      <td className="py-3 text-zinc-400">{owner}</td>
      <td className="py-3 text-zinc-400">{project}</td>
      <td className="py-3 text-zinc-500 font-mono text-[10px]">{date}</td>
      <td className="py-3 text-right">
        <span className={`px-2.5 py-1.5 rounded-xl text-[9px] font-bold ${getStatusStyle(status)}`}>
          {status}
        </span>
      </td>
    </tr>
  );
};

// DayItem Subcomponent
const DayItem = ({ day, num, active = false }: any) => {
  return (
    <div className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all ${active ? 'bg-white text-zinc-950 font-bold scale-110 shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}>
      <span className="text-[8px] uppercase tracking-wide font-bold">{day}</span>
      <span className="text-xs font-semibold">{num}</span>
    </div>
  );
};

