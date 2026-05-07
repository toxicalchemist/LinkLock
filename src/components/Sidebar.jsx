import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Archive, Activity, Settings, PlusSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  const navItems = [
    { name: 'Secure Vault', path: '/', icon: PlusSquare },
    { name: 'Active Instances', path: '/vaults', icon: Archive },
  ];

  if (user?.role === 'admin') {
    navItems.unshift({ name: 'Overview', path: '/admin', icon: LayoutDashboard });
    navItems.push({ name: 'User Management', path: '/admin/users', icon: Shield });
    navItems.push({ name: 'Security Audit', path: '/admin/logs', icon: Activity });
    navItems.push({ name: 'System Settings', path: '/admin/settings', icon: Settings });
  }

  return (
    <div className="w-64 bg-[#121212] border-r border-[#2A2A2A] h-screen flex flex-col shadow-2xl">
      <div className="h-20 flex items-center px-6 border-b border-[#2A2A2A] shrink-0">
        <div className="flex items-center gap-3">
          <img src={logo} alt="LinkLock" className="w-10 h-10 object-contain brightness-0 invert opacity-80" />
          <h1 className="text-xl font-medium tracking-widest text-slate-200">LINKLOCK</h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2 px-2">Navigation</div>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin' || item.path === '/'}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-sans tracking-wide border ${
                isActive 
                  ? 'bg-copper/10 border-copper/30 text-copper font-medium' 
                  : 'border-transparent text-slate-400 hover:bg-[#1A1A1A] hover:text-slate-200'
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </div>
      
      <div className="p-6 border-t border-[#2A2A2A] text-xs text-slate-600 font-mono text-center">
        v2.0.0 | Enterprise Edition
      </div>
    </div>
  );
};

export default Sidebar;
