import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Calendar, BookOpen, Clock, Award, 
  Search, ArrowRight, X, Sparkles, Code, CheckCircle, Flame
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../store/AuthContext';
import api from '../services/api';

const chartData = [
  { name: 'Mon', Tasks: 3 },
  { name: 'Tue', Tasks: 7 },
  { name: 'Wed', Tasks: 5 },
  { name: 'Thu', Tasks: 9 },
  { name: 'Fri', Tasks: 6 },
  { name: 'Sat', Tasks: 4 },
  { name: 'Sun', Tasks: 8 },
];

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [searchSubject, setSearchSubject] = useState('');
  const [subjects, setSubjects] = useState([
    'Python Programming', 'RAG Retrieval', 'Machine Learning', 
    'Database Admin', 'System Security', 'Vite & React'
  ]);
  const [days, setDays] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);

  // Generate calendar days
  useEffect(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const current = new Date();
    const result = [];
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date();
      date.setDate(current.getDate() + i);
      result.push({
        dayName: dayNames[date.getDay()],
        dayNum: date.getDate(),
        isToday: i === 0,
        index: i
      });
    }
    setDays(result);
    setSelectedDay(0); // Today is 0
  }, []);

  const handleAddSubject = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchSubject.trim() !== '') {
      if (!subjects.includes(searchSubject.trim())) {
        setSubjects([...subjects, searchSubject.trim()]);
      }
      setSearchSubject('');
    }
  };

  const handleRemoveSubject = (sub: string) => {
    setSubjects(subjects.filter(s => s !== sub));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Personal dashboard, performance metrics, and daily overview.</p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Statistics, Charts, Subjects (Col Span: 7) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          
          {/* Statistics Section */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Statistics</h3>
              <button className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-0.5">
                View all <ArrowRight size={12} />
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 text-white p-5 rounded-2xl flex flex-col justify-between h-32 hover:scale-[1.02] transition-transform duration-200 cursor-pointer shadow-lg shadow-slate-950/20">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400">Today's Tasks</span>
                  <ArrowRight size={16} className="text-slate-400" />
                </div>
                <h2 className="text-3xl font-extrabold">5</h2>
              </div>

              <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between h-32 hover:scale-[1.02] transition-transform duration-200 cursor-pointer">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed Tasks</span>
                  <ArrowRight size={16} className="text-slate-400" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">42</h2>
              </div>

              <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between h-32 hover:scale-[1.02] transition-transform duration-200 cursor-pointer">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Hours</span>
                  <ArrowRight size={16} className="text-slate-400" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">8</h2>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="Tasks" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom section layout: Subjects on Left, Premium on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Subjects/Interest Tags */}
            <div className="glass-card p-6 md:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">Subjects</h3>
                  <button className="text-xs text-slate-500 hover:underline">View all</button>
                </div>

                <div className="relative mb-4">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={14} className="text-slate-400" />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Find / Add subject..." 
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                    onKeyDown={handleAddSubject}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {subjects.map((sub, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      {sub}
                      <button onClick={() => handleRemoveSubject(sub)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Go Premium Card */}
            <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl md:col-span-5 flex flex-col justify-between overflow-hidden hover:scale-[1.02] transition-transform duration-200 cursor-pointer shadow-lg">
              {/* Background Glow */}
              <div className="absolute right-0 bottom-0 w-36 h-36 bg-blue-500/20 rounded-full blur-3xl" />
              
              <div className="relative space-y-2">
                <div className="inline-flex items-center justify-center p-2 rounded-xl bg-white/10 backdrop-blur-md text-amber-400">
                  <Sparkles size={18} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">25% off<br />premium</h3>
                <p className="text-xs text-slate-400">Unlock advanced multi-agent orchestrator & continuous training.</p>
              </div>

              <button className="relative w-full py-2.5 mt-6 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors shadow-md shadow-white/10">
                Go Premium
              </button>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Profile details, Horizontal Calendar, Schedule Timeline (Col Span: 5) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          
          {/* Profile Card */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">User profile</h3>
            <div className="flex gap-4 items-start">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name?.replace(' ', '+') || 'Aadhi'}&background=6366f1&color=fff&size=80`} 
                alt="Profile photo" 
                className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-slate-200 dark:border-slate-700"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{user?.name || 'Aadhi'}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-100 dark:border-brand-800">
                    {user?.role || 'Staff Member'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Department:</span> {user?.department || 'Engineering'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Joined:</span> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'October 20, 2023'}
                </p>
              </div>
            </div>
          </div>

          {/* Horizontal Calendar Widget */}
          <div className="bg-slate-950 dark:bg-slate-900 text-white p-5 rounded-2xl flex justify-between items-center border border-slate-800">
            {days.map((d, index) => {
              const isSelected = d.index === selectedDay;
              return (
                <button 
                  key={index} 
                  onClick={() => setSelectedDay(d.index)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isSelected ? 'bg-white text-slate-950 font-bold scale-110 shadow-lg shadow-white/10' : 'text-slate-400 hover:text-white'}`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-tight">{d.dayName}</span>
                  <span className="text-sm font-semibold">{d.dayNum}</span>
                </button>
              );
            })}
          </div>

          {/* Daily Schedule Timeline */}
          <div className="glass-card p-6 flex-1 flex flex-col justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-brand-500" /> Daily Schedule
            </h3>

            {/* Timeline Events */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              
              {/* Event 1 */}
              <div className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-brand-500 shadow-sm" />
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-medium flex items-center gap-1"><Clock size={10} /> 9:30 AM - 11:30 AM</span>
                    <span className="font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">Lectures</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-brand-500 transition-colors">
                    Review Engineering Guidelines
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Host: Albert Florence (Source: <span className="underline cursor-pointer">Engineering_Guidelines.pdf</span>)
                  </p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 shadow-sm" />
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-medium flex items-center gap-1"><Clock size={10} /> 12:00 PM - 1:00 PM</span>
                    <span className="font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">Meeting</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-brand-500 transition-colors">
                    1-on-1 Sync on Qdrant DB
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Host: Andrew Smith (Source: <span className="underline cursor-pointer">IT_Network_Security_Report.pdf</span>)
                  </p>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-purple-500 shadow-sm animate-pulse" />
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-medium flex items-center gap-1"><Clock size={10} /> 2:30 PM - 3:30 PM</span>
                    <span className="font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">Lab Session</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-brand-500 transition-colors">
                    RAG Stream Perf Diagnostics
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Tiny Avatars */}
                    <div className="flex -space-x-1.5">
                      <div className="w-5 h-5 rounded-full border border-white dark:border-slate-800 bg-brand-500 flex items-center justify-center text-[8px] text-white font-bold">A</div>
                      <div className="w-5 h-5 rounded-full border border-white dark:border-slate-800 bg-purple-500 flex items-center justify-center text-[8px] text-white font-bold">D</div>
                      <div className="w-5 h-5 rounded-full border border-white dark:border-slate-800 bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold">M</div>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Team session</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
