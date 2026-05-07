import React, { useEffect, useState } from 'react';
import { getUsers, deactivateUser } from '../../services/api';
import { Users as UsersIcon, UserX, UserCheck, Shield, Mail, Calendar, Key } from 'lucide-react';
import { useSnackbar } from '../../context/SnackbarContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useSnackbar();

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      await deactivateUser(userId);
      showToast('User status updated successfully', 'success');
      fetchUsers();
    } catch (err) {
      showToast('Failed to update user status', 'error');
    }
  };

  if (loading) {
    return <div className="text-copper animate-pulse font-mono tracking-widest mt-12">DECRYPTING USER RECORDS...</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 border-b border-[#2A2A2A] pb-6">
        <div className="flex items-center gap-3">
            <UsersIcon className="text-copper w-8 h-8" />
            <h1 className="text-3xl font-light tracking-tight text-slate-100">User Management</h1>
        </div>
        <p className="text-slate-500 font-mono text-sm">Monitor system participants and manage account accessibility.</p>
      </div>

      <div className="overflow-x-auto border border-[#2A2A2A] rounded-xl bg-[#121212] shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1A1A1A] border-b border-[#2A2A2A]">
              <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-slate-500">Identity</th>
              <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-slate-500">Role</th>
              <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-slate-500">Registration</th>
              <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-slate-500">Activity</th>
              <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]">
            {users.map((user, index) => (
              <tr key={user._id} className={index % 2 === 0 ? 'bg-[#121212]' : 'bg-[#161616]'}>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-100 font-medium">{user.fullName}</span>
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Mail size={12} /> {user.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-tighter ${user.role === 'admin' ? 'bg-copper/20 text-copper border border-copper/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-slate-400 font-mono">
                   <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-600" />
                        {new Date(user.createdAt).toLocaleDateString()}
                   </div>
                </td>
                <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-300 font-mono text-sm">
                            <Key size={14} className="text-copper" />
                            {user.secretCount} Secrets
                        </div>
                        <span className={`text-[10px] uppercase font-bold ${user.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {user.isActive ? 'Active' : 'Deactivated'}
                        </span>
                    </div>
                </td>
                <td className="px-6 py-5 text-right">
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => handleToggleStatus(user._id)}
                      className={`p-2 rounded transition-colors ${user.isActive ? 'bg-red-950/30 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-950/30 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                      title={user.isActive ? 'Deactivate Account' : 'Activate Account'}
                    >
                      {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <div className="text-slate-600 p-2">
                        <Shield size={18} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
