import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { getSecret } from '../services/api';
import { Lock, Unlock, AlertTriangle, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from '../context/SnackbarContext';

const ViewSecret = () => {
    const { key } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [secretMessage, setSecretMessage] = useState('');
    const [error, setError] = useState('');
    const [viewed, setViewed] = useState(false);
    const [locked, setLocked] = useState(false);
    const [decrypting, setDecrypting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [fileData, setFileData] = useState({ url: null, type: null, name: null });
    const { showToast } = useSnackbar();
    
    // We get the decryption key from the URL hash component, or fallback to key for private vaults
    const aesKey = location.hash.replace('#', '') || key;

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

            if (err.response?.status === 403) {
                showToast('UNAUTHORIZED: This secret was not intended for you.', 'error');
                setError('UNAUTHORIZED: This secret was not intended for you.');
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else if (err.response?.status === 401 || err.response?.data?.requireLogin) {
                showToast('IDENTITY_REQUIRED: Unauthorized access. Redirecting...', 'info');
                setTimeout(() => {
                    navigate('/login', { state: { from: location } });
                }, 1500);
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
        <div className="min-h-screen flex items-center justify-center w-full p-4 bg-[#0a0a0a]">
            <AnimatePresence mode="wait">
                {isVisible && !locked ? (
                    <motion.div 
                        key="active-panel"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                        className="w-full max-w-2xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 shadow-[0_0_50px_-12px_rgba(249,115,22,0.3)] rounded-lg overflow-hidden relative"
                    >
                        {/* Security IDs */}
                        <div className="absolute top-3 left-4 text-[10px] text-zinc-600 font-mono tracking-widest">SYS.ID // {key.substring(0,8)}</div>
                        <div className="absolute top-3 right-4 text-[10px] text-zinc-600 font-mono tracking-widest">STATUS // ACTIVE</div>
                        
                        <div className="p-8 md:p-12 mt-4">
                            {!viewed && !error && !decrypting && (
                                <div className="text-center flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6 border border-zinc-700/50 shadow-inner">
                                        <AlertTriangle size={32} className="text-copper" />
                                    </div>
                                    <h2 className="text-xl md:text-2xl text-white font-sans font-light tracking-widest mb-4">INCOMING_ENCRYPTED_TRANSMISSION</h2>
                                    <p className="text-zinc-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                                        Viewing this payload will trigger internal logging. 
                                        Once limits are exceeded, protocol dictates autonomous database scrub.
                                    </p>
                                    <button 
                                        onClick={handleReveal}
                                        className="bg-copper/10 hover:bg-copper border border-copper/50 hover:border-copper text-copper hover:text-black font-mono tracking-wider py-3 px-8 rounded transition-all duration-300 flex items-center gap-3 uppercase text-sm"
                                    >
                                        <Unlock size={16} /> INITIATE_DECRYPTION
                                    </button>
                                </div>
                            )}

                            {decrypting && (
                                <div className="text-center py-8">
                                    <Terminal size={48} className="text-copper mx-auto mb-6 animate-pulse" />
                                    <h3 className="text-copper font-mono tracking-widest mb-4 text-lg">BRUTE_FORCING_HASH...</h3>
                                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
                                        <div className="h-full bg-copper transition-all duration-100 ease-linear" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                    </div>
                                    <p className="text-zinc-500 font-mono text-sm tracking-widest">
                                        {Math.floor(progress)}% DECRYPTED
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded flex items-start gap-4">
                                    <AlertTriangle size={24} className="shrink-0 mt-0.5" />
                                    <div className="font-sans text-sm leading-relaxed">{error}</div>
                                </div>
                            )}

                            {viewed && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex flex-col"
                                >
                                    <div className="flex items-center gap-3 text-white mb-6 font-sans font-light tracking-wide border-b border-zinc-800 pb-4">
                                        <Unlock className="text-copper" size={20} /> PAYLOAD_DECRYPTED
                                    </div>
                                    
                                    {secretMessage && (
                                        <div className="w-full overflow-x-auto text-left font-mono text-sm text-zinc-300 bg-black/40 border-l-2 border-copper p-6 mb-6 rounded-r">
                                            <pre className="whitespace-pre-wrap font-inherit">{secretMessage}</pre>
                                        </div>
                                    )}
                                    
                                    {fileData.url && (
                                        <div className="mb-8 p-6 bg-black/40 border border-zinc-800 rounded">
                                            <h4 className="text-copper font-mono text-xs tracking-widest mb-4 uppercase">ATTACHED_SECURE_FILE</h4>
                                            {fileData.type && fileData.type.startsWith('image/') ? (
                                                <div className="w-full flex justify-center bg-black/60 p-2 border border-zinc-800 rounded">
                                                    <img 
                                                        src={`http://localhost:5000${fileData.url}`} 
                                                        alt={fileData.name} 
                                                        className="w-full h-auto max-h-[50vh] object-contain" 
                                                    />
                                                </div>
                                            ) : (
                                                <a href={`http://localhost:5000${fileData.url}`} download={fileData.name} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full py-3 px-6 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-sm tracking-widest transition-colors rounded">
                                                    DOWNLOAD {fileData.name || 'FILE'}
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={handleLock}
                                        className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-500 font-mono tracking-widest py-3 rounded transition-all duration-300 mt-2 text-sm uppercase hover:text-red-400"
                                    >
                                        ACKNOWLEDGE_&_PURGE
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                ) : null}
                
                {locked && (
                    <motion.div 
                        key="locked-panel"
                        initial={{ opacity: 0, scale: 1.1, filter: 'brightness(2) contrast(1.5)', x: -10 }}
                        animate={{ opacity: 1, scale: 1, filter: 'brightness(1) contrast(1)', x: 0 }}
                        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                        className="w-full max-w-lg bg-zinc-950 border border-red-900/50 shadow-[0_0_40px_-10px_rgba(220,38,38,0.2)] rounded-lg overflow-hidden p-10 text-center relative"
                    >
                        {/* Glitch lines overlay */}
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(0,0,0,0.5)_3px)] pointer-events-none opacity-30"></div>
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <Lock className="text-red-600 mb-6" size={64} strokeWidth={1.5} />
                            <h2 className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] text-2xl md:text-3xl font-mono tracking-[0.2em] font-bold mb-4">DATA_EXPUNGED</h2>
                            <p className="text-zinc-500 text-sm font-sans max-w-sm">
                                This secret has been permanently deleted from the LinkLock servers.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ViewSecret;
