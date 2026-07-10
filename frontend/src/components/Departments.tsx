import React, { useState, useEffect } from 'react';
import { Building2, Users, FileText } from 'lucide-react';
import api from '../services/api';

interface Department {
  id: number;
  name: string;
  description: string;
  document_count: number;
}

export const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments/');
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading departments...</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col justify-center items-start gap-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="text-brand-500" /> Departments
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage organizational departments and view their knowledge base usage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="glass-card p-6 flex flex-col hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{dept.name}</h3>
              <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Building2 size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1">
              {dept.description || 'No description provided.'}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
                <FileText size={16} className="mr-2 text-slate-400" />
                {dept.document_count} Documents
              </div>
            </div>
          </div>
        ))}
        {departments.length === 0 && (
          <p className="text-slate-500">No departments found.</p>
        )}
      </div>
    </div>
  );
};
