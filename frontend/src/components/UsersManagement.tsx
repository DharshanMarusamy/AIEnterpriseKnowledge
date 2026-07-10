import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit2, Trash2, Shield, Building2, Check, X } from 'lucide-react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  department_id: number | null;
  is_active: boolean;
  last_login: string;
}

export const UsersManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    const email = prompt("Enter email address to invite:");
    if (email) {
      try {
        await api.post('/auth/invite', { email, role: 'Viewer' });
        alert(`Invitation sent to ${email}`);
      } catch (err) {
        console.error("Failed to invite user", err);
        alert("Failed to send invite");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users & Roles</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage user access, roles, and department assignments.</p>
        </div>
        <button onClick={handleInvite} className="btn-primary">
          <UserPlus size={16} className="mr-2" /> Invite User
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{users.length}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><UserPlus size={20} /></div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Roles</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">4</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl"><Shield size={20} /></div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Departments</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl"><Building2 size={20} /></div>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="input-field py-2 text-sm w-full sm:w-auto">
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
            <select className="input-field py-2 text-sm w-full sm:w-auto">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Last Login</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center">No users found.</td></tr>
              ) : users.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${(user.name || 'User').replace(' ', '+')}&background=random&color=fff`} 
                        alt={user.name || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-200">{user.name || 'Unknown User'}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <Shield size={12} /> {user.role || 'Viewer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{user.department_id || 'Global'}</td>
                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <Check size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <X size={12} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg transition-colors"><Edit2 size={16} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 size={16} /></button>
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
