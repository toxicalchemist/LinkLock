import React, { useEffect, useState } from 'react';
import { getAdminOverview, clearLegacyLogs, getSettings, updateSettings } from '../../services/api';
import { Activity, Flame, Clock, Radio, Database, Settings, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from '../../context/SnackbarContext';

const Dashboard = () => {
    const [data, setData] = useState({
        activeSecrets: 0,
        burnedInstances: 0,
        logs: []
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isGlitching, setIsGlitching] = useState(false);
    const [filterEventType, setFilterEventType] = useState('ALL');
    const [searchLinkId, setSearchLinkId] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [settings, setSettings] = useState({ maintenanceMode: false, globalMaxExpiry: 604800 });
    const { showToast } = useSnackbar();

    const filteredLogs = (data.logs || []).map(log => ({
        ...log,
        _normalizedEvent: log.event || log.eventType || 'SYSTEM_ACTION',
        _normalizedLinkId: log.linkId || log.targetId || log.secretKey || (log.documentKey && log.documentKey._id) || 'N/A',
        _normalizedReason: log.reason || log.details || 'Automatic Data Scrub'
    })).filter(log => {
        const matchType = filterEventType === 'ALL' || log._normalizedEvent === filterEventType;
        const matchLink = log._normalizedLinkId.toLowerCase().includes(searchLinkId.toLowerCase());
        return matchType && matchLink;
    });

    const handleClearLegacy = async () => {
        if(window.confirm('Delete all UNKNOWN logs missing strict Mongoose schema bindings?')) {
            await clearLegacyLogs();
            showToast('MANUAL_OVERRIDE: Instance deleted by administrator.', 'error');
            fetchData();
        }
    };

    const fetchData = async () => {
        try {
            const overview = await getAdminOverview();
            const fetchedSettings = await getSettings();
            setSettings(fetchedSettings);
            
            if (overview && overview.logs) {
                // Check if burned instances went up
                if (overview.burnedInstances > data.burnedInstances && data.burnedInstances > 0) {
                    setIsGlitching(true);
                    setTimeout(() => setIsGlitching(false), 1000); // 1s glitch
                }

                setData(overview);
                setLastUpdated(new Date());
                setError('');
            } else {
                setError('Received malformed data from Command Center Server.');
            }
        } catch (err) {
            setError('Failed to connect to Command Center Server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            await updateSettings(settings);
            showToast('SYSTEM_SETTINGS_UPDATED', 'success');
        } catch (err) {
            showToast('FAILED_TO_UPDATE_SETTINGS', 'error');
        }
    };

    const handleDownloadAudit = () => {
        window.open('http://localhost:5000/api/admin/logs/export', '_blank');
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [data.burnedInstances]);

    return (
        <motion.div 
            className="admin-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
        >
            <motion.div 
                className={`admin-header ${isGlitching ? 'glitch-anim' : ''}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Radio size={32} className="pulse-icon" color="var(--primary-color)" />
                    <h1>COMMAND_CENTER</h1>
                </div>
                <div className="admin-meta" style={{ fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                    <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}> ACTIVE</span>
                    <span style={{ marginLeft: '20px', color: 'var(--text-muted)' }}>
                        Ping: {lastUpdated.toLocaleTimeString()}
                    </span>
                </div>
            </motion.div>

            <div className="flex gap-4 mb-6 border-b border-slate-700/50 pb-2">
                <button 
                    onClick={() => setActiveTab('overview')} 
                    className={`font-mono uppercase tracking-widest text-sm px-4 py-2 transition-colors ${activeTab === 'overview' ? 'text-copper border-b-2 border-copper' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    System Overview
                </button>
                <button 
                    onClick={() => setActiveTab('settings')} 
                    className={`font-mono uppercase tracking-widest text-sm px-4 py-2 transition-colors ${activeTab === 'settings' ? 'text-copper border-b-2 border-copper' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Global Policy
                </button>
            </div>

            {error && <div className="alert-message alert-error">{error}</div>}

            {activeTab === 'overview' ? (
                <>
                    <motion.div 
                className="status-cards-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
            >
                <motion.div 
                    className="status-card glow-green glass-panel min-h-48"
                    whileHover={{ scale: 1.02 }}
                >
                    <Database size={48} color="var(--primary-color)" />
                    <div className="card-info">
                        <h3>ACTIVE SECRETS</h3>
                        <div className="card-value text-7xl font-mono">{data.activeSecrets}</div>
                    </div>
                </motion.div>

                <motion.div 
                    className={`status-card glow-red glass-panel min-h-48 ${isGlitching ? 'status-card-red-pulse glitch-anim' : ''}`}
                    whileHover={{ scale: 1.02 }}
                >
                    <Flame size={48} color="var(--secondary-color)" />
                    <div className="card-info">
                        <h3>BURNED INSTANCES</h3>
                        <motion.div 
                            key={data.burnedInstances}
                            className="card-value text-red text-7xl font-mono"
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            {data.burnedInstances}
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div 
                className="audit-log-container glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
            >
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', marginTop: 0, paddingBottom: '1rem' }}>
                    <Activity color="var(--primary-color)" /> SYSTEM_LOGS
                    <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-3 h-3 bg-[#991B1B] rounded-full ml-4" />
                </h3>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search by Link ID..." 
                        value={searchLinkId}
                        onChange={e => setSearchLinkId(e.target.value)}
                        style={{ flex: 2, minWidth: '200px' }}
                    />
                    <select 
                        className="form-control" 
                        value={filterEventType}
                        onChange={e => setFilterEventType(e.target.value)}
                        style={{ flex: 1, minWidth: '200px' }}
                    >
                        <option value="ALL">ALL EVENTS</option>
                        <option value="SYSTEM_ACTION">SYSTEM_ACTION</option>
                        <option value="BURN_LIMIT_REACHED">BURN_LIMIT_REACHED</option>
                        <option value="BURN_EXPIRED">BURN_EXPIRED</option>
                        <option value="BURN_MANUAL">BURN_MANUAL</option>
                    </select>
                    <button 
                        onClick={handleDownloadAudit}
                        className="btn-primary"
                        style={{ width: 'auto', marginTop: 0, padding: '0.8rem 1.5rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Download size={16} /> DOWNLOAD AUDIT
                    </button>
                    <button 
                        onClick={handleClearLegacy} 
                        className="btn-danger" 
                        style={{ width: 'auto', marginTop: 0, padding: '0.8rem 1.5rem', whiteSpace: 'nowrap' }}
                    >
                        CLEAR LEGACY LOGS
                    </button>
                </div>
                
                <table className="audit-table font-sans text-lg border-collapse w-full relative">
                    <thead className="sticky top-0 z-20 bg-[#121212] border-b border-[#2D2D2D]">
                        <tr>
                            <th className="p-4 text-left font-medium text-slate-400">TIMESTAMP</th>
                            <th className="p-4 text-left font-medium text-slate-400">EVENT</th>
                            <th className="p-4 text-left font-medium text-slate-400">LINK ID</th>
                            <th className="p-4 text-left font-medium text-slate-400">REASON</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="border border-emerald-500/30 p-4 text-center text-emerald-400">_INITIALIZING_DATA_STREAM_...</td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="border border-emerald-500/30 p-4 text-center text-gray-500">_NO_RECORDS_FOUND_</td>
                            </tr>
                        ) : (
                            <AnimatePresence>
                                {filteredLogs.map((log) => (
                                    <motion.tr 
                                        key={log._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="odd:bg-[#121212] even:bg-[#1A1A1A] hover:bg-[#202020] transition-colors"
                                    >
                                        <td className="p-4 text-slate-300 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className={`p-4 font-mono ${log._normalizedEvent.includes('BURN') ? 'text-white font-medium' : 'text-slate-400'}`}>
                                            {log._normalizedEvent}
                                        </td>
                                        <td className="p-4 text-slate-500 font-mono">{log._normalizedLinkId}</td>
                                        <td className="p-4 break-words max-w-[250px] text-slate-400 font-mono">{log._normalizedReason}</td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        )}
                    </tbody>
                </table>
            </motion.div>
                </>
            ) : (
                <motion.div 
                    className="glass-panel p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h3 className="flex items-center gap-2 text-slate-100 font-sans tracking-widest mb-6">
                        <Settings className="text-copper" />
                        GLOBAL_SECURITY_POLICY
                    </h3>
                    
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between p-4 border border-slate-700/50 bg-slate-900/40 rounded-xl">
                            <div>
                                <h4 className="text-slate-200 font-mono text-lg m-0">MAINTENANCE_MODE</h4>
                                <p className="text-slate-500 font-mono text-sm mt-1">Disables the creation of new secure links. Existing links remain accessible.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={settings.maintenanceMode} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})} />
                                <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-copper"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-700/50 bg-slate-900/40 rounded-xl">
                            <div className="flex-1">
                                <h4 className="text-slate-200 font-mono text-lg m-0">GLOBAL_MAX_EXPIRY (Seconds)</h4>
                                <p className="text-slate-500 font-mono text-sm mt-1">The maximum lifespan allowed for any newly created payload across the entire system. Maximum default is 7 days (604800).</p>
                            </div>
                            <div className="flex items-center gap-4 ml-8">
                                <input 
                                    type="number" 
                                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-200 font-mono focus:border-copper focus:ring-1 focus:ring-copper outline-none transition-all w-48"
                                    value={settings.globalMaxExpiry}
                                    onChange={(e) => setSettings({...settings, globalMaxExpiry: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveSettings}
                            className="btn-primary mt-4 py-3 font-mono tracking-widest uppercase bg-copper hover:bg-copper/90 transition-all self-start"
                        >
                            ENFORCE_NEW_POLICY
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Dashboard;
