import React, { useState, useEffect } from 'react';
import { Bookmark as BookmarkIcon, FileText, Download, MoreVertical, File, FileImage, Trash2 } from 'lucide-react';
import api from '../services/api';

interface Bookmark {
  id: number;
  document_id: number;
  document: {
    id: number;
    title: string;
    filename: string;
    file_type: string;
    department_id: number | null;
    created_at: string;
  };
}

export const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookmarks/');
      // Map API response
      const mapped = res.data.map((b: any) => ({
        ...b,
        document: {
          ...b.document,
          created_at: new Date(b.document.created_at).toLocaleDateString()
        }
      }));
      setBookmarks(mapped);
    } catch (err) {
      console.error("Failed to fetch bookmarks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docId: number, filename: string) => {
    try {
      const response = await api.get(`/documents/${docId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download file");
    }
  };

  const handleRemove = async (documentId: number) => {
    try {
      await api.delete(`/bookmarks/${documentId}`);
      setBookmarks(prev => prev.filter(b => b.document_id !== documentId));
    } catch (err) {
      console.error("Failed to remove bookmark", err);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="text-red-500" />;
    if (type.includes('doc')) return <FileText className="text-blue-500" />;
    if (type.includes('csv') || type.includes('sheet')) return <FileText className="text-green-500" />;
    if (type.includes('image')) return <FileImage className="text-amber-500" />;
    return <File className="text-slate-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col justify-center items-start gap-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookmarkIcon className="text-brand-500" /> Bookmarks
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your saved documents for quick access.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium">Document Name</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Date Modified</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">Loading bookmarks...</td></tr>
              ) : bookmarks.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">No bookmarks found.</td></tr>
              ) : bookmarks.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(b.document.file_type)}
                      <span className="font-medium text-slate-900 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{b.document.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs">{b.document.department_id || 'Global'}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{b.document.file_type.split('/')[1] || 'Unknown'}</td>
                  <td className="px-6 py-4 text-slate-500">{b.document.created_at}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDownload(b.document_id, b.document.filename)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg"><Download size={16} /></button>
                      <button onClick={() => handleRemove(b.document_id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
