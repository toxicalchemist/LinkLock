import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { getSecret } from '../services/api';
import { Lock, Unlock, AlertTriangle, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from '../context/SnackbarContext';

const ViewSecret = () => {
    const { key } = useParams();
    const location = useLocation();
    
    const [secretMessage, setSecretMessage] = useState('');
    const [error, setError] = useState('');
    const [viewed, setViewed] = useState(false);
    const [locked, setLocked] = useState(false);
    const [decrypting, setDecrypting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [fileData, setFileData] = useState({ url: null, type: null, name: null });
    const { showToast } = useSnackbar();
    
    // We get the decryption key from the URL hash component
    const aesKey = location.hash.replace('#', '');

    const handleReveal = async () => {
        if (!aesKey) {
            setError('CRITICAL: Decryption key missing from URL hash.');
            return;
        }

        setDecrypting(true);
        setProgress(0);

        // Simulate a "high-tech decrypting" progress bar
        const progressInterval = setInterval(() => {
            setProgress(p => {
                if (p >= 95) return p;
                return p + Math.random() * 15;
            });
        }, 100);

        try {
            const data = await getSecret(key);
            
            // Decrypt local
            const bytes = CryptoJS.AES.decrypt(data.encryptedContent, aesKey);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
            
            if (decryptedData === '' && !data.fileUrl) {
                clearInterval(progressInterval);
                setDecrypting(false);
                setError('CHECKSUM FAILED: Invalid key or corrupted data.');
                return;
            }

            setProgress(100);
            clearInterval(progressInterval);
            
            setTimeout(() => {
                setDecrypting(false);
                setSecretMessage(decryptedData);
                if (data.fileUrl) {
                    setFileData({
                        url: data.fileUrl,
                        type: data.fileType,
                        name: data.originalFileName
                    });
                }
                setViewed(true);
            }, 500);
            
        } catch (err) {
            clearInterval(progressInterval);
            setDecrypting(false);
            const errMsg = err.response?.data?.error || 'DATA PURGED: Secret not found or burned.';
            setError(errMsg);
            if (errMsg.includes('burned') || errMsg.includes('DATA PURGED') || errMsg.includes('not found')) {
                showToast('PROTOCOL_EXECUTED: View limit reached. Data has been purged.', 'error');
            }
        }
    };

    const handleLock = () => {
        setIsVisible(false);
        showToast('PROTOCOL_EXECUTED: View limit reached. Data has been purged.', 'error');
        // We use AnimatePresence on exit to trigger scale-down and fade
        setTimeout(() => {
            setLocked(true);
        }, 500); // Wait for exit animation
    };

    return (
        <motion.div 
            className="vault-ui w-full max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
            <AnimatePresence mode="wait">
                {isVisible && !locked ? (
                    <motion.div 
                        className="glass-panel"
                        key="active-panel"
                        exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5 }}
                    >
                        {!viewed && !error && !decrypting && (
                            <div style={{ textAlign: 'center' }}>
                                <AlertTriangle size={56} color="#FFFFFF" style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
                                <h2 style={{ color: '#FFFFFF', fontFamily: 'var(--font-sans)', fontWeight: 300, letterSpacing: '1px' }}>INCOMING_ENCRYPTED_TRANSMISSION</h2>
                                <p style={{ marginBottom: '2.5rem', color: 'var(--text-muted)' }}>
                                    Viewing this payload will trigger internal logging. 
                                    Once limits are exceeded, protocol dictates autonomous database scrub.
                                </p>
                                <button className="btn-primary" onClick={handleReveal}>
                                    <Unlock size={18} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                                    INITIATE_DECRYPTION
                                </button>
                            </div>
                        )}

                        {decrypting && (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <Terminal size={48} color="var(--primary-color)" className="pulse-icon" style={{ marginBottom: '1rem' }} />
                                <h3 style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-mono)' }}>BRUTE_FORCING_HASH...</h3>
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                </div>
                                <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                    {Math.floor(progress)}% DECRYPTED
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="alert-message alert-error">
                                <AlertTriangle size={24} />
                                <div style={{ fontFamily: 'var(--font-sans)' }}>{error}</div>
                            </div>
                        )}

                        {viewed && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h3 style={{ color: '#FFFFFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-sans)', fontWeight: 300 }}>
                                    <Unlock /> PAYLOAD_DECRYPTED
                                </h3>
                                
                                {secretMessage && (
                                    <div className="secret-content w-full overflow-x-auto text-left" style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.4)', borderLeft: '4px solid #B45309', padding: '2rem', marginTop: '2rem' }}>
                                        {secretMessage}
                                    </div>
                                )}
                                
                                {fileData.url && (
                                    <div style={{ marginTop: '1.5rem', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid #2D2D2D' }}>
                                        <h4 style={{ color: '#B45309', marginTop: 0, marginBottom: '1rem', fontFamily: 'var(--font-mono)', textAlign: 'left' }}>ATTACHED_SECURE_FILE</h4>
                                        {fileData.type && fileData.type.startsWith('image/') ? (
                                            <div className="w-full flex justify-center bg-black/50 p-2 border border-[#2D2D2D]">
                                                <img 
                                                    src={`http://localhost:5000${fileData.url}`} 
                                                    alt={fileData.name} 
                                                    className="w-full h-auto max-h-[60vh] object-contain" 
                                                />
                                            </div>
                                        ) : (
                                            <a href={`http://localhost:5000${fileData.url}`} download={fileData.name} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-block', textAlign: 'center', width: 'auto', padding: '0.8rem 1.5rem' }}>
                                                DOWNLOAD {fileData.name || 'FILE'}
                                            </a>
                                        )}
                                    </div>
                                )}
                                
                                <button className="btn-danger" onClick={handleLock}>
                                    ACKNOWLEDGE_&_PURGE
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                ) : null}
                
                {locked && (
                    <motion.div 
                        className="glass-panel locked-screen"
                        key="locked-panel"
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                    >
                        <Lock className="locked-icon" />
                        <h2 style={{ color: 'var(--secondary-color)', fontSize: '2rem', letterSpacing: '4px', fontFamily: 'var(--font-mono)' }}>SYSTEM_LOCKED</h2>
                        <p style={{ color: 'var(--text-muted)' }}>This memory sector has been permanently overwritten.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ViewSecret;
