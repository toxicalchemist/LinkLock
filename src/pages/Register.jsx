import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSnackbar } from '../context/SnackbarContext';
import { Shield, UserPlus } from 'lucide-react';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { showToast } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return showToast('Passwords do not match', 'error');
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Registration successful! Please login.', 'success');
        navigate('/login');
      } else {
        console.error("Auth Error:", data.error);
        showToast(data.error || 'Registration failed', 'error');
      }
    } catch (err) {
      console.error("Auth Error:", err);
      showToast('Network error', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden p-6">
      {/* High-Tech Background Animation */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'linear-gradient(#2A2A2A 1px, transparent 1px), linear-gradient(90deg, #2A2A2A 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            animation: 'grid-move 20s linear infinite'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-[#121212]"></div>
      </div>

      <style>
        {`
          @keyframes grid-move {
            0% { transform: translateY(0); }
            100% { transform: translateY(40px); }
          }
        `}
      </style>

      {/* Branding Header */}
      <div className="mb-10 text-center z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Shield className="text-copper w-12 h-12" />
          <h1 className="text-5xl font-bold text-slate-100 tracking-[0.2em]">LINKLOCK</h1>
        </div>
        <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Corporate Data Governance & Audit System</p>
      </div>

      {/* Enterprise Entry Card */}
      <div className="w-full max-w-md p-10 border border-[#2A2A2A] rounded-none bg-[#121212]/90 backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-copper to-transparent opacity-50"></div>
        
        <h2 className="text-2xl font-bold tracking-[0.3em] uppercase text-slate-100 mb-8 text-center">
          New Operative
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
          <div className="relative group/input">
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1 group-focus-within/input:text-copper transition-colors">Full Name</label>
            <input
              type="text"
              className="w-full bg-[#2D2D2D] border-b-2 border-[#2A2A2A] focus:border-copper rounded-none p-3 text-slate-200 font-mono outline-none transition-all focus:shadow-[0_4px_12px_-4px_rgba(180,83,9,0.3)]"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="relative group/input">
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1 group-focus-within/input:text-copper transition-colors">Corporate Email</label>
            <input
              type="email"
              className="w-full bg-[#2D2D2D] border-b-2 border-[#2A2A2A] focus:border-copper rounded-none p-3 text-slate-200 font-mono outline-none transition-all focus:shadow-[0_4px_12px_-4px_rgba(180,83,9,0.3)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group/input">
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1 group-focus-within/input:text-copper transition-colors">Security Password</label>
            <input
              type="password"
              className="w-full bg-[#2D2D2D] border-b-2 border-[#2A2A2A] focus:border-copper rounded-none p-3 text-slate-200 font-mono outline-none transition-all focus:shadow-[0_4px_12px_-4px_rgba(180,83,9,0.3)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="relative group/input">
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1 group-focus-within/input:text-copper transition-colors">Confirm Password</label>
            <input
              type="password"
              className="w-full bg-[#2D2D2D] border-b-2 border-[#2A2A2A] focus:border-copper rounded-none p-3 text-slate-200 font-mono outline-none transition-all focus:shadow-[0_4px_12px_-4px_rgba(180,83,9,0.3)]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="mt-4 w-full bg-copper hover:bg-copper/90 text-white font-bold py-4 px-4 rounded-none transition-all shadow-[0_4px_15px_rgba(184,115,51,0.2)] hover:shadow-[0_4px_25px_rgba(184,115,51,0.4)] uppercase tracking-[0.2em] text-sm"
          >
            Register
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs font-mono text-slate-400">
            Already have an account? {' '}
            <Link to="/login" className="text-copper hover:text-copper/80 transition-colors underline decoration-copper/30 underline-offset-4">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
