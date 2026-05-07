import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, LayoutDashboard, LogIn, LogOut, Archive } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-full flex flex-col items-center mb-12">
      <div className="flex flex-col items-center justify-center pt-8 pb-6 gap-4 w-full">
        <Link to="/" className="relative flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
          <div className="absolute right-full mr-4 flex items-center justify-center">
            <motion.img 
              src={logo} 
              alt="LinkLock Logo" 
              className="w-16 h-16 md:w-24 md:h-24 object-contain brightness-0 invert" 
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-thin tracking-tighter drop-shadow-md text-slate-50 m-0 leading-tight text-center">
            LINKLOCK
          </h1>
        </Link>
      </div>

      <div className="w-full max-w-4xl flex justify-between items-center px-6 py-3 border-y border-slate-700/50 bg-slate-900/40 backdrop-blur-md">
        <Link to="/" className="text-slate-300 hover:text-copper transition-colors flex items-center gap-2 font-mono uppercase tracking-widest text-sm">
          <Shield size={16} className="text-copper" />
          Secure Drop
        </Link>
        <div className="flex items-center gap-6 text-sm font-mono uppercase tracking-widest">
          {user ? (
            <>
              <Link to="/vaults" className="text-slate-400 hover:text-copper transition-colors flex items-center gap-2">
                <Archive size={16} />
                My Vaults
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-slate-400 hover:text-copper transition-colors flex items-center gap-2">
                  <LayoutDashboard size={16} />
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="text-slate-400 hover:text-copper transition-colors flex items-center gap-2">
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-400 hover:text-copper transition-colors flex items-center gap-2">
                <LogIn size={16} />
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
