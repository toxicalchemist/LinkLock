import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { Mail, Clock, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getInbox } from '../services/api';

const Inbox = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { showToast } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchInbox = async () => {
      try {
        const data = await getInbox();
        setLinks(data);
      } catch (err) {
        console.error('Fetch Inbox Error:', err);
        showToast(err.response?.data?.error || 'Failed to fetch inbox', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [user, navigate, showToast]);

  if (loading) {
    return <div className="text-copper animate-pulse font-mono tracking-widest mt-12">DECRYPTING INBOX RECORDS...</div>;
  }

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4">
        <Mail className="text-copper w-8 h-8" />
        <h2 className="text-3xl font-light tracking-tight text-slate-100">Secure Inbox</h2>
      </div>

      {links.length === 0 ? (
        <div className="p-8 border border-slate-800 rounded-xl bg-slate-900/40 backdrop-blur-sm text-center">
          <p className="text-slate-400 font-mono mb-4">Your secure inbox is empty.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {links.map(link => (
            <div key={link.id} className="p-5 rounded-xl border border-slate-700/50 bg-slate-900/40 hover:border-copper/50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-300 font-bold">From: {link.senderEmail}</span>
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Received: {new Date(link.createdAt).toLocaleString()}
                </div>
                <div className="text-xs font-mono flex items-center gap-1 text-slate-400">
                  <Clock size={12} /> Expires: {new Date(link.expiresAt).toLocaleString()}
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <Link to={`/view/${link.key}`} className="btn-primary py-2 px-4 flex items-center gap-2 whitespace-nowrap mt-0 bg-copper/20 hover:bg-copper text-copper hover:text-slate-900 border-none transition-colors">
                  <ExternalLink size={16} /> Open Vault
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox;
