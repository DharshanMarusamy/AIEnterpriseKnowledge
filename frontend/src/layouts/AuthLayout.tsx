import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">AI Enterprise</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Knowledge Assistant Platform</p>
        </div>
        
        {/* Auth Content */}
        <Outlet />
        
        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} AI Enterprise. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
