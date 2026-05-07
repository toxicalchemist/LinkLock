import React, { useEffect, useState } from 'react';
import { getAdminOverview, clearLegacyLogs } from '../../services/api';
import { Activity, Download, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from '../../context/SnackbarContext';

const SecurityAudit = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterEventType, setFilterEventType] = useState('ALL');
  const [searchLinkId, setSearchLinkId] = useState('');
  const { showToast } = useSnackbar();

  const fetchLogs = async () => {
    try {
      const overview = await getAdminOverview();
      if (overview && overview.logs) {
        setLogs(overview.logs);
      }
    } catch (err) {
      showToast('Failed to load audit logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClearLegacy = async () => {
    if (window.confirm('Delete all UNKNOWN logs missing strict Mongoose schema bindings?')) {
      await clearLegacyLogs();
      showToast('MANUAL_OVERRIDE: Legacy logs purged.', 'error');
      fetchLogs();
    }
  };

  const handleDownloadAudit = () => {
    window.open('http://localhost:5000/api/admin/logs/export', '_blank');
  };

  const filteredLogs = logs.map(log => ({
    ...log,
    _normalizedEvent: log.event || log.eventType || 'SYSTEM_ACTION',
    _normalizedLinkId: log.linkId || log.targetId || log.secretKey || (log.documentKey && log.documentKey._id) || 'N/A',
    _normalizedReason: log.reason || log.details || 'Automatic Data Scrub'
  })).filter(log => {
    const matchType = filterEventType === 'ALL' || log._normalizedEvent === filterEventType;
    const matchLink = log._normalizedLinkId.toLowerCase().includes(searchLinkId.toLowerCase());
    return matchType && matchLink;
  });

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 border-b border-[#2A2A2A] pb-6 flex-wrap">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-slate-100 flex items-center gap-3">
              <Activity className="text-copper" /> Security Audit
            </h1>
            <p className="text-slate-500 font-mono text-sm mt-2">Immutable ledger of all system events and cryptographic actions.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleDownloadAudit}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg font-mono text-sm flex items-center gap-2 transition-colors border border-slate-700"
            >
              <Download size={16} /> Export CSV
            </button>
            <button 
              onClick={handleClearLegacy}
              className="bg-red-900/20 hover:bg-red-900/40 text-red-500 px-4 py-2 rounded-lg font-mono text-sm flex items-center gap-2 transition-colors border border-red-900/50"
            >
              <Trash2 size={16} /> Purge Legacy
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-lg flex flex-col">
        <div className="p-4 border-b border-[#2A2A2A] bg-[#161616] flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Filter by Link ID..." 
              value={searchLinkId}
              onChange={e => setSearchLinkId(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg py-2 pl-10 pr-4 text-slate-300 font-mono text-sm focus:border-copper outline-none transition-colors"
            />
          </div>
          <select 
            value={filterEventType}
            onChange={e => setFilterEventType(e.target.value)}
            className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg py-2 px-4 text-slate-300 font-mono text-sm focus:border-copper outline-none transition-colors sm:w-64"
          >
            <option value="ALL">ALL EVENTS</option>
            <option value="SYSTEM_ACTION">SYSTEM_ACTION</option>
            <option value="BURN_LIMIT_REACHED">BURN_LIMIT_REACHED</option>
            <option value="BURN_EXPIRED">BURN_EXPIRED</option>
            <option value="BURN_MANUAL">BURN_MANUAL</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#161616] border-b border-[#2A2A2A]">
              <tr>
                <th className="p-4 font-mono text-xs text-slate-500 uppercase tracking-widest">Timestamp</th>
                <th className="p-4 font-mono text-xs text-slate-500 uppercase tracking-widest">Event</th>
                <th className="p-4 font-mono text-xs text-slate-500 uppercase tracking-widest">Link ID</th>
                <th className="p-4 font-mono text-xs text-slate-500 uppercase tracking-widest">Reason / Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500 font-mono animate-pulse">
                    [ SCANNING_LEDGER ]
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500 font-mono">
                    NO_RECORDS_MATCHING_CRITERIA
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredLogs.map((log) => (
                    <motion.tr 
                      key={log._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-[#2A2A2A]/50 hover:bg-[#1A1A1A] transition-colors"
                    >
                      <td className="p-4 text-slate-400 font-mono text-sm whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-mono font-medium ${
                          log._normalizedEvent.includes('BURN') ? 'bg-red-900/20 text-red-400 border border-red-900/50' : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {log._normalizedEvent}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 font-mono text-sm">{log._normalizedLinkId}</td>
                      <td className="p-4 text-slate-500 font-mono text-sm max-w-md truncate" title={log._normalizedReason}>
                        {log._normalizedReason}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityAudit;
