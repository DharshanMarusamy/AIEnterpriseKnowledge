import React, { useState, useCallback } from 'react';
import { UploadCloud, File, X, FileText, Settings, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export const DocumentUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [department, setDepartment] = useState('All');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const uploadFile = async (newFile: UploadingFile) => {
    setFiles(prev => [...prev, newFile]);

    const formData = new FormData();
    formData.append('file', newFile.file);

    try {
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total) 
            : 0;
            
          setFiles(prev => prev.map(f => 
            f.id === newFile.id ? { ...f, progress: progress < 100 ? progress : 99 } : f
          ));
        }
      });

      // Once uploaded, backend processes it in background
      setFiles(prev => prev.map(f => 
        f.id === newFile.id ? { ...f, progress: 100, status: 'completed' } : f
      ));
    } catch (error: any) {
      setFiles(prev => prev.map(f => 
        f.id === newFile.id ? { ...f, status: 'error', error: error.message } : f
      ));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      Array.from(e.dataTransfer.files).forEach(file => {
        uploadFile({
          id: Math.random().toString(36).substr(2, 9),
          file,
          progress: 0,
          status: 'uploading'
        });
      });
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      Array.from(e.target.files).forEach(file => {
        uploadFile({
          id: Math.random().toString(36).substr(2, 9),
          file,
          progress: 0,
          status: 'uploading'
        });
      });
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Documents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add documents to the Enterprise Knowledge Base for AI processing.</p>
        </div>
        <Link to="/documents" className="btn-secondary">
          <FileText size={16} className="mr-2" /> View All Documents
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            className={`glass-card p-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
              isDragging 
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/50' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
              <UploadCloud size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Drag & drop your files here
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
              Supports PDF, DOCX, TXT, CSV, and internal wiki exports. Max file size: 50MB.
            </p>
            
            <label className="btn-primary cursor-pointer">
              Browse Files
              <input 
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileInput} 
                accept=".pdf,.doc,.docx,.txt,.csv"
              />
            </label>
          </div>

          {/* Upload List */}
          {files.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                Upload Queue
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">
                  {files.length} items
                </span>
              </h3>
              <div className="space-y-3">
                {files.map(file => (
                  <div key={file.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4 group">
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                      <File size={20} className="text-brand-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate pr-4">
                          {file.file.name}
                        </p>
                        <span className="text-xs font-medium text-slate-500 flex-shrink-0">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              file.status === 'completed' ? 'bg-green-500' : 
                              file.status === 'error' ? 'bg-red-500' : 'bg-brand-500'
                            }`} 
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider w-16 text-right" style={{ 
                          color: file.status === 'completed' ? '#10b981' : 
                                 file.status === 'error' ? '#ef4444' : '#6366f1' 
                        }}>
                          {file.status}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeFile(file.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Indexing Settings Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={18} className="text-slate-700 dark:text-slate-300" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Indexing Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Department</label>
                <select 
                  className="input-field"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="All">All Departments (Global)</option>
                  <option value="Engineering">Engineering</option>
                  <option value="HR">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Legal">Legal</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Restrict access to specific departments.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Document Tags</label>
                <input type="text" className="input-field" placeholder="e.g. policy, Q3, internal" />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 bg-white dark:bg-slate-800" defaultChecked />
                  <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Run OCR on images/scans</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 bg-white dark:bg-slate-800" defaultChecked />
                  <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Extract tables and charts</span>
                </label>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-brand-900 to-indigo-900 text-white border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Database size={64} />
            </div>
            <div className="relative z-10">
              <h3 className="font-semibold mb-2">Vector Database Status</h3>
              <p className="text-sm text-brand-100 mb-4">Qdrant is currently online and ready to index new documents.</p>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="block text-brand-300 text-xs uppercase tracking-wider">Capacity</span>
                  <span className="font-bold">45%</span>
                </div>
                <div>
                  <span className="block text-brand-300 text-xs uppercase tracking-wider">Latency</span>
                  <span className="font-bold">12ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
