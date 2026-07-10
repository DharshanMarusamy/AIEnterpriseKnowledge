import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate initial load / check auth token
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center animate-fade-in">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-8 shadow-2xl shadow-indigo-500/40">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">AI Enterprise</h1>
      <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">Initializing Knowledge Assistant...</p>
      <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
    </div>
  );
};
