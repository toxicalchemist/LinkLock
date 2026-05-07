import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { Archive, Flame, CheckCircle2, FileLock2, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyVaults } from '../services/api';

const MyVaults = () => {
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { showToast } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchVaults = async () => {
      try {
        const data = await getMyVaults();
        setVaults(data);
      } catch (err) {
        console.error('Fetch Vaults Error:', err);
        showToast(err.response?.data?.error || 'Failed to fetch vaults', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchVaults();
  }, [user, navigate, showToast]);

  if (loading) {
    return <div className="text-copper animate-pulse font-mono tracking-widest mt-12">DECRYPTING VAULT RECORDS...</div>;
  }

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4">
        <Archive className="text-copper w-8 h-8" />
        <h2 className="text-3xl font-light tracking-tight text-slate-100">My Vaults</h2>
      </div>

      {vaults.length === 0 ? (
        <div className="p-8 border border-slate-800 rounded-xl bg-slate-900/40 backdrop-blur-sm text-center">
          <p className="text-slate-400 font-mono mb-4">No active or burned links found in your vault.</p>
          <Link to="/" className="inline-block bg-copper/20 hover:bg-copper text-copper hover:text-slate-900 font-mono py-2 px-6 rounded-md transition-all">
            CREATE NEW LINK
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {vaults.map(vault => (
            <div key={vault.id} className={`p-5 rounded-xl border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all ${vault.status === 'Burned' ? 'border-red-900/50 bg-red-950/10' : 'border-slate-700/50 bg-slate-900/40 hover:border-copper/50'}`}>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-300 font-bold">{vault.key}</span>
                  {vault.hasFile && <FileLock2 size={14} className="text-copper" />}
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Created: {new Date(vault.createdAt).toLocaleString()}
                </div>
                {vault.status === 'Live' && (
                  <div className="text-xs font-mono text-slate-500">
                    Expires: {new Date(vault.expiresAt).toLocaleString()}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end gap-1">
                  <div className={`flex items-center gap-1 text-sm font-mono uppercase tracking-wider ${vault.status === 'Burned' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {vault.status === 'Burned' ? <Flame size={14} /> : <CheckCircle2 size={14} />}
                    {vault.status}
                  </div>
                  <div className="text-xs font-mono text-slate-500">
                    Views: {vault.currentViews} / {vault.viewLimit}
                  </div>
                </div>
                
                {vault.status === 'Live' && (
                  <Link to={`/view/${vault.key}`} className="p-2 rounded-lg bg-slate-800 hover:bg-copper hover:text-slate-900 text-slate-400 transition-colors">
                    <ExternalLink size={18} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyVaults;
