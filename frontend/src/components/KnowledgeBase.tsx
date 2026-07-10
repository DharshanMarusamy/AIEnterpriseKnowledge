import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, FileText, Download, File, FileImage, 
  Folder, Database, UploadCloud, Bookmark, Trash2, X, 
  ChevronDown, AlertTriangle, RefreshCw, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Department { id: number; name: string; document_count: number; }
interface Document {
  id: number; title: string; filename: string;
  file_type: string; department_id: number | null;
  created_at: string; status: string;
}

export const KnowledgeBase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchDocuments();
    fetchDepartments();
  }, []);

  // Close filter panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments/');
      setDepartments(res.data);
    } catch (err) { console.error('Failed to load departments', err); }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents/');
      setDocuments(res.data.map((d: any) => ({
        id: d.id,
        title: d.title,
        filename: d.filename,
        file_type: d.file_type || 'application/octet-stream',
        department_id: d.department_id,
        created_at: new Date(d.created_at).toLocaleDateString(),
        status: 'Indexed',
      })));
    } catch (err) { console.error('Failed to load documents', err); }
    finally { setLoading(false); }
  };

  const handleDownload = (id: number, filename: string) => {
    // Use the api baseURL directly so auth headers are included
    const baseURL = (api.defaults.baseURL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
    const url = `${baseURL}/documents/${id}/download`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloading ${filename}...`, true);
  };

  const confirmDelete = (id: number, title: string) => setDeleteTarget({ id, title });

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setDeleteTarget(null);
    try {
      await api.delete(`/documents/${deleteTarget.id}`);
      setDocuments(prev => prev.filter(d => d.id !== deleteTarget.id));
      showToast(`"${deleteTarget.title}" deleted successfully.`, true);
    } catch (err: any) {
      console.error('Failed to delete document', err);
      showToast(`Failed to delete: ${err?.response?.data?.detail || err.message}`, false);
    } finally {
      setDeletingId(null);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="text-red-500 flex-shrink-0" size={18} />;
    if (type.includes('doc')) return <FileText className="text-blue-500 flex-shrink-0" size={18} />;
    if (type.includes('csv') || type.includes('sheet')) return <FileText className="text-green-500 flex-shrink-0" size={18} />;
    if (type.includes('image')) return <FileImage className="text-amber-500 flex-shrink-0" size={18} />;
    return <File className="text-slate-400 flex-shrink-0" size={18} />;
  };

  const getFileTypeLabel = (type: string) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word') || type.includes('doc')) return 'DOCX';
    if (type.includes('sheet') || type.includes('csv') || type.includes('excel')) return 'CSV';
    if (type.includes('text')) return 'TXT';
    const parts = type.split('/');
    return (parts[1] || type).toUpperCase().slice(0, 6);
  };

  // Apply all filters
  const filtered = documents
    .filter(d => {
      const matchSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.filename.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = selectedDepartment === null || d.department_id === selectedDepartment;
      const matchType = typeFilter === 'all' ||
        (typeFilter === 'pdf' && d.file_type.includes('pdf')) ||
        (typeFilter === 'doc' && (d.file_type.includes('doc') || d.file_type.includes('word'))) ||
        (typeFilter === 'csv' && (d.file_type.includes('csv') || d.file_type.includes('sheet')));
      return matchSearch && matchDept && matchType;
    })
    .sort((a, b) => sortBy === 'name' 
      ? a.title.localeCompare(b.title) 
      : b.created_at.localeCompare(a.created_at));

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentDocs = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 whenever filters change
  const handleSearch = (v: string) => { setSearchQuery(v); setCurrentPage(1); };
  const handleDeptSelect = (id: number | null) => { setSelectedDepartment(id); setCurrentPage(1); };
  const handleTypeFilter = (t: string) => { setTypeFilter(t); setCurrentPage(1); };

  const activeFilters = (typeFilter !== 'all' ? 1 : 0) + (selectedDepartment !== null ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium animate-slide-up ${toast.ok ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.ok ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Delete Document</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Are you sure you want to delete:
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 mb-4 truncate">
              📄 {deleteTarget.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              This will permanently remove the document and all its indexed vectors from the knowledge base.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Knowledge Base</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, and manage all indexed company documents.
            <span className="ml-2 text-brand-600 dark:text-brand-400 font-semibold">{documents.length} total</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/upload" className="btn-primary">
            <UploadCloud size={16} className="mr-2" /> Upload
          </Link>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or filename..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-slate-900 dark:text-white text-sm"
          />
          {searchQuery && (
            <button onClick={() => handleSearch('')} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${filterOpen || activeFilters > 0 ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-300 dark:border-brand-600 text-brand-700 dark:text-brand-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-300'}`}
          >
            <Filter size={15} />
            Filters
            {activeFilters > 0 && (
              <span className="bg-brand-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFilters}</span>
            )}
            <ChevronDown size={13} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Filter Dropdown */}
          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-5 w-72 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Filter Documents</h4>
                <button
                  onClick={() => { setTypeFilter('all'); handleDeptSelect(null); handleSearch(''); }}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                >
                  Clear all
                </button>
              </div>

              {/* File Type */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">File Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'all', label: 'All Types' },
                    { value: 'pdf', label: '📄 PDF' },
                    { value: 'doc', label: '📝 Word' },
                    { value: 'csv', label: '📊 CSV/Sheet' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleTypeFilter(opt.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${typeFilter === opt.value ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-400 text-brand-700 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Sort By</p>
                <div className="flex gap-2">
                  {[{ v: 'date', l: 'Latest First' }, { v: 'name', l: 'Name A-Z' }].map(s => (
                    <button
                      key={s.v}
                      onClick={() => setSortBy(s.v as any)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${sortBy === s.v ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-400 text-brand-700 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                    >
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Department */}
              {departments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Department</p>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    <button
                      onClick={() => handleDeptSelect(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${selectedDepartment === null ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      All Departments
                    </button>
                    {departments.map(dept => (
                      <button
                        key={dept.id}
                        onClick={() => handleDeptSelect(dept.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${selectedDepartment === dept.id ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        {dept.name} <span className="text-slate-400">({dept.document_count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchDocuments}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Sidebar: Departments */}
        <div className="space-y-4">
          <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Departments</h3>
            </div>
            <div className="p-2">
              <button
                onClick={() => handleDeptSelect(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${selectedDepartment === null ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <div className="flex items-center gap-2">
                  <Folder size={16} /> All
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${selectedDepartment === null ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{documents.length}</span>
              </button>
              {departments.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => handleDeptSelect(dept.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors mt-1 ${selectedDepartment === dept.id ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-2">
                    <Folder size={16} className={selectedDepartment === dept.id ? 'text-brand-500' : 'text-slate-400'} />
                    <span className="truncate text-left">{dept.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${selectedDepartment === dept.id ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{dept.document_count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Card */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stats</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Total</span>
              <span className="font-bold text-slate-900 dark:text-white">{documents.length} files</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Filtered</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{filtered.length} files</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Indexed</span>
              <span className="font-bold text-green-600 dark:text-green-400">{documents.filter(d => d.status === 'Indexed').length}</span>
            </div>
          </div>
        </div>

        {/* Document Table */}
        <div className="lg:col-span-3">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Document</th>
                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Dept.</th>
                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <RefreshCw className="animate-spin text-brand-500" size={22} />
                          <span className="text-sm">Loading documents...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Database size={28} className="text-slate-300" />
                          <span className="text-sm font-medium">No documents match your filters</span>
                          <button onClick={() => { handleSearch(''); handleDeptSelect(null); setTypeFilter('all'); }} className="text-xs text-brand-600 hover:underline mt-1">Clear filters</button>
                        </div>
                      </td>
                    </tr>
                  ) : currentDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-brand-50/30 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          {getFileIcon(doc.file_type)}
                          <span className="font-medium text-slate-900 dark:text-slate-200 truncate text-xs" title={doc.title}>{doc.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium">
                          {departments.find(d => d.id === doc.department_id)?.name || 'Global'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-500 dark:text-slate-400">
                          {getFileTypeLabel(doc.file_type)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{doc.created_at}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${doc.status === 'Indexed' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${doc.status === 'Indexed' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {/* Always-visible action buttons */}
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleDownload(doc.id, doc.filename)}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            onClick={() => {
                              api.post('/bookmarks/', { document_id: doc.id })
                                .then(() => showToast('Bookmarked!', true))
                                .catch(() => showToast('Failed to bookmark', false));
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title="Bookmark"
                          >
                            <Bookmark size={15} />
                          </button>
                          <button
                            onClick={() => confirmDelete(doc.id, doc.title)}
                            disabled={deletingId === doc.id}
                            className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
                            title="Delete"
                          >
                            {deletingId === doc.id
                              ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              : <Trash2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {filtered.length === 0 ? '0 results' : `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filtered.length)} of ${filtered.length}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors font-medium"
                >
                  ← Prev
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${currentPage === page ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
