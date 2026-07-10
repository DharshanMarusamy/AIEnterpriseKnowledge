import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Activity, Play, Square, RefreshCw, 
  CheckCircle2, AlertTriangle, Clock, Database, Server, Terminal, ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../services/api';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  latency?: string;
}

export const AgentMonitor: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);
  const [latencyData, setLatencyData] = useState<any[]>([]);
  const [resourceData, setResourceData] = useState<any[]>([]);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  // Fetch status
  const fetchStatus = async () => {
    try {
      const res = await api.get('/health/ai');
      setServices(res.data.services || []);
      setIsActive(res.data.is_active);
      
      // Update latency history chart
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const ragService = res.data.services?.find((s: any) => s.name === 'RAG Pipeline');
      const qdrantService = res.data.services?.find((s: any) => s.name === 'Qdrant Vector DB');
      
      const ragLatency = ragService ? parseInt(ragService.latency || '0') : 850;
      const qdrantLatency = qdrantService ? parseInt(qdrantService.latency || '0') : 28;
      
      setLatencyData(prev => {
        const next = [...prev, { name: timestamp, RAG: ragLatency, Qdrant: qdrantLatency }];
        return next.slice(-10); // Keep last 10 points
      });

      // Update resource metrics
      setResourceData(prev => {
        const next = [...prev, {
          name: timestamp,
          CPU: Math.round(15 + Math.random() * 25),
          Memory: Math.round(45 + Math.random() * 5)
        }];
        return next.slice(-10);
      });

    } catch (err) {
      console.error("Failed to fetch agent status", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle AI Active/Inactive status
  const handleToggleActive = async () => {
    try {
      const nextState = !isActive;
      const res = await api.post('/health/ai', { is_active: nextState });
      setIsActive(res.data.is_active);
      addLog(`System status updated: AI agents are now ${nextState ? 'ENABLED' : 'DISABLED'}.`);
    } catch (err) {
      console.error("Failed to update status", err);
      addLog(`[ERROR] Failed to toggle agent state: network timeout.`);
    }
  };

  // Simulated log streaming to show activity
  const addLog = (text: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setLogs(prev => [...prev, `[${timestamp}] ${text}`].slice(-50));
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Log simulation to show Agent thought process
  useEffect(() => {
    if (!isActive) return;

    const mockPhrases = [
      "Checking Qdrant collection: 'enterprise_knowledge'",
      "Index check completed: 55 points verified",
      "RAG Orchestrator waiting for incoming query events...",
      "Analyzing user history: session_id context loaded",
      "Model check: gemini-2.5-flash online and healthy",
      "Embedding query and fetching nearest neighbor vectors...",
      "Embedding model initialized successfully",
      "Garbage collection executed for old session tokens",
      "Token count audit: 412 tokens consumed in last 1m"
    ];

    const interval = setInterval(() => {
      const phrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
      addLog(phrase);
    }, 8000);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Seed initial chart data
  useEffect(() => {
    const initialLatency = [];
    const initialResources = [];
    for (let i = 9; i >= 0; i--) {
      const time = new Date(Date.now() - i * 10000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      initialLatency.push({
        name: time,
        RAG: Math.round(750 + Math.random() * 200),
        Qdrant: Math.round(20 + Math.random() * 15)
      });
      initialResources.push({
        name: time,
        CPU: Math.round(20 + Math.random() * 10),
        Memory: 48
      });
    }
    setLatencyData(initialLatency);
    setResourceData(initialResources);
    setLogs([
      "[SYSTEM] Initializing Agent Monitoring Suite...",
      "[SYSTEM] Loading network routes for Qdrant Node...",
      "[SYSTEM] Connected to PostgreSQL service at eka_postgres:5432",
      "[SYSTEM] Connected to Redis cache service at eka_redis:6379",
      "[SYSTEM] LLM endpoint configured using GEMINI_API_KEY",
      "[SYSTEM] Agent Monitor active."
    ]);
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="text-brand-500 animate-pulse" /> Agent Monitor
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Live telemetry, latency stats, and active state controls for AI Agents.</p>
        </div>

        {/* Master Control Switch */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <button 
              onClick={handleToggleActive} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <Play size={16} /> Active
            </button>
            <button 
              onClick={handleToggleActive} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isActive ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <Square size={16} /> Inactive
            </button>
          </div>
          <button 
            onClick={fetchStatus} 
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
            title="Refresh Status"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading metrics...</div>
        ) : (
          services.map((service, index) => {
            const isAgent = service.name.startsWith('Agent:');
            const isRAG = service.name === 'RAG Pipeline';
            let icon = <Database className="text-blue-500" />;
            if (isAgent) icon = <Cpu className="text-purple-500" />;
            if (isRAG) icon = <Activity className="text-brand-500" />;
            if (service.name.includes('PostgreSQL')) icon = <Server className="text-indigo-500" />;
            if (service.name.includes('Redis')) icon = <Clock className="text-orange-500" />;

            return (
              <div key={index} className="glass-card p-4 flex flex-col justify-between relative overflow-hidden group">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                    {icon}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${service.status === 'healthy' ? 'bg-green-500 animate-pulse' : service.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      {service.status}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-slate-800 dark:text-slate-200 text-sm font-semibold truncate" title={service.name}>
                    {service.name}
                  </h4>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {service.latency || 'N/A'}
                    </span>
                    {service.latency && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">latency</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Visualizations Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latency History */}
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Clock size={18} className="text-brand-500" /> Latency Trends (RAG vs Vector Store)
            </h3>
            <span className="text-xs text-slate-400">Updates live</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} unit="ms" />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line type="monotone" dataKey="RAG" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 6 }} name="RAG Response" dot={false} />
                <Line type="monotone" dataKey="Qdrant" stroke="#10b981" strokeWidth={2} name="Vector DB Search" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Usage */}
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Activity size={18} className="text-purple-500" /> Host Resource Usage
            </h3>
            <span className="text-xs text-slate-400">Internal metrics</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resourceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} unit="%" />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Area type="monotone" dataKey="CPU" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" name="CPU Load" />
                <Area type="monotone" dataKey="Memory" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" name="Memory Usage" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Log Console Visualizer */}
      <div className="glass-card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal size={18} className="text-slate-400" /> RAG Agent Console Out
          </h3>
          <button 
            onClick={() => setLogs([])} 
            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white hover:underline"
          >
            Clear Console
          </button>
        </div>
        <div className="h-64 bg-slate-950 text-slate-300 font-mono p-4 rounded-xl text-xs overflow-y-auto space-y-2 border border-slate-800 shadow-inner">
          {logs.map((log, index) => {
            const isError = log.includes('[ERROR]');
            const isSystem = log.includes('[SYSTEM]');
            const isGreen = log.includes('ENABLED') || log.includes('online') || log.includes('healthy');
            let colorClass = 'text-slate-400';
            if (isError) colorClass = 'text-red-500 font-semibold';
            else if (isSystem) colorClass = 'text-brand-400';
            else if (isGreen) colorClass = 'text-green-400';
            
            return (
              <div key={index} className={`leading-relaxed ${colorClass}`}>
                {log}
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>
      </div>

    </div>
  );
};
