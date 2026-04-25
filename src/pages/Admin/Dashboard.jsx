import React, { useEffect, useState } from 'react';
import { getAdminOverview, clearLegacyLogs } from '../../services/api';
import { Activity, Flame, Clock, Radio, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            fetchData();
        }
    };

    const fetchData = async () => {
        try {
            const overview = await getAdminOverview();
            
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

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [data.burnedInstances]);

    return (
        <motion.div 
            className="admin-dashboard"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
            <div className={`admin-header ${isGlitching ? 'glitch-anim' : ''}`}>
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
            </div>

            {error && <div className="alert-message alert-error">{error}</div>}

            <div className="status-cards-container">
                <motion.div 
                    className="status-card glow-green glass-panel"
                    whileHover={{ scale: 1.02 }}
                >
                    <Database size={48} color="var(--primary-color)" />
                    <div className="card-info">
                        <h3>ACTIVE SECRETS</h3>
                        <div className="card-value">{data.activeSecrets}</div>
                    </div>
                </motion.div>

                <motion.div 
                    className={`status-card glow-red glass-panel ${isGlitching ? 'status-card-red-pulse glitch-anim' : ''}`}
                    whileHover={{ scale: 1.02 }}
                >
                    <Flame size={48} color="var(--secondary-color)" />
                    <div className="card-info">
                        <h3>BURNED INSTANCES</h3>
                        <motion.div 
                            key={data.burnedInstances}
                            className="card-value text-red"
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            {data.burnedInstances}
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            <motion.div 
                className="audit-log-container glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', marginTop: 0, paddingBottom: '1rem' }}>
                    <Activity color="var(--primary-color)" /> SYSTEM_LOGS
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
                        onClick={handleClearLegacy} 
                        className="btn-danger" 
                        style={{ width: 'auto', marginTop: 0, padding: '0.8rem 1.5rem', whiteSpace: 'nowrap' }}
                    >
                        CLEAR LEGACY LOGS
                    </button>
                </div>
                
                <table className="audit-table">
                    <thead>
                        <tr>
                            <th><Clock size={14}/> TIMESTAMP</th>
                            <th>EVENT</th>
                            <th>LINK ID</th>
                            <th>REASON</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--primary-color)' }}>_INITIALIZING_DATA_STREAM_...</td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>_NO_RECORDS_FOUND_</td>
                            </tr>
                        ) : (
                            <AnimatePresence>
                                {filteredLogs.map((log) => (
                                    <motion.tr 
                                        key={log._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className={log._normalizedEvent.includes('BURN') ? 'event-burn' : ''}>
                                            {log._normalizedEvent}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{log._normalizedLinkId}</td>
                                        <td className="reason-col">{log._normalizedReason}</td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        )}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
