import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-20 border-b border-[#2A2A2A] bg-[#0A0A0A] flex justify-between items-center px-8 shrink-0">
      <div className="flex items-center gap-4">
        {/* Breadcrumb or Title could go here */}
      </div>
      
      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-r border-[#2A2A2A] pr-6">
              <UserCircle className="text-slate-400" size={24} />
              <div className="flex flex-col">
                <span className="text-sm text-slate-200 font-medium tracking-wide">
                  {user.fullName}
                </span>
                <span className="text-xs text-slate-500 font-mono tracking-widest uppercase">
                  {user.role === 'admin' ? 'System Admin' : 'Operative'}
                </span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-copper transition-colors flex items-center gap-2 text-sm font-sans uppercase tracking-widest"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="text-slate-400 hover:text-copper transition-colors flex items-center gap-2 text-sm font-sans uppercase tracking-widest"
          >
            <UserCircle size={16} />
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;
