import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { createSecret } from '../services/api';
import { Shield, Eye, UploadCloud, X, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSnackbar } from '../context/SnackbarContext';

const CreateSecret = () => {
    const [message, setMessage] = useState('');
    const [viewLimit, setViewLimit] = useState(1);
    const [expiryValue, setExpiryValue] = useState(24);
    const [expiryUnit, setExpiryUnit] = useState('Hours');
    const [loading, setLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    const [error, setError] = useState('');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const { showToast } = useSnackbar();

    const handleFileDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const generateRandomStr = (length) => {
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setGeneratedLink('');

        try {
            const aesKey = generateRandomStr(16);
            const documentKey = generateRandomStr(16);
            const encryptedContent = CryptoJS.AES.encrypt(message, aesKey).toString();

            const formData = new FormData();
            formData.append('key', documentKey);
            formData.append('encryptedContent', encryptedContent);
            formData.append('iv', 'auto');
            formData.append('viewLimit', parseInt(viewLimit));
            formData.append('expiryValue', parseInt(expiryValue));
            formData.append('expiryUnit', expiryUnit);
            
            if (file) {
                formData.append('file', file);
                showToast('UPLOADING_BINARY: File is being secured...', 'success');
            }

            await createSecret(formData);
            showToast('SYSTEM_INITIALIZED: Secure link generated successfully.', 'success');

            const url = `${window.location.origin}/view/${documentKey}#${aesKey}`;
            setGeneratedLink(url);
            
        } catch (err) {
            setError(err.response?.data?.error || 'System fault: Connection refused.');
        } finally {
            setLoading(false);
        }
    };

    const maxChars = 50000;
    const progressPerc = Math.min((message.length / maxChars) * 100, 100);
    const radius = 10;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPerc / 100) * circumference;

    return (
        <motion.div 
            className="vault-ui w-full max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="glass-panel">
                {!generatedLink && (
                    <form onSubmit={handleCreate} className="flex flex-col gap-6">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#F8FAFC', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)', fontWeight: 300 }}>
                            <Shield /> SECURE_VAULT_UPLOAD
                        </h2>
                        
                        {error && <div className="alert-message alert-error">{error}</div>}

                        <div className="form-group flex flex-col text-left">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-xl font-medium text-slate-400 tracking-wider uppercase m-0">PAYLOAD_DATA</label>
                                <div className="flex items-center gap-3" title={`${Math.floor(progressPerc)}% Payload Capacity`}>
                                    <span className="font-mono text-sm text-[#B45309]">{message.length.toLocaleString()} / {maxChars.toLocaleString()}</span>
                                    <svg width="24" height="24" className="transform -rotate-90">
                                        <circle 
                                            cx="12" cy="12" r={radius} 
                                            fill="transparent" 
                                            stroke="#2D2D2D" 
                                            strokeWidth="3" 
                                        />
                                        <circle 
                                            cx="12" cy="12" r={radius} 
                                            fill="transparent" 
                                            stroke="#B45309" 
                                            strokeWidth="3" 
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset}
                                            style={{ transition: "stroke-dashoffset 0.3s ease" }}
                                        />
                                    </svg>
                                </div>
                            </div>
                            <textarea 
                                className="form-control text-lg font-mono" 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter encrypted payload here..."
                                required={!file}
                            />
                        </div>

                        <div 
                            className={`form-group file-dropzone flex flex-col text-left ${isDragging ? 'dragging' : ''} border-2 border-dashed ${isDragging ? 'border-[#B45309]' : 'border-[#2D2D2D]'} hover:border-[#B45309] transition-colors relative overflow-hidden`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleFileDrop}
                            onClick={() => document.getElementById('file-upload').click()}
                            style={{
                                padding: '2rem',
                                textAlign: 'center',
                                borderRadius: '0px',
                                cursor: 'pointer',
                                backgroundColor: isDragging ? 'rgba(180, 83, 9, 0.05)' : 'transparent',
                                marginBottom: '1.5rem',
                                position: 'relative'
                            }}
                        >
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)', backgroundSize: '20px 20px', animation: 'spin-slow 60s linear infinite' }}></div>
                            <input 
                                id="file-upload" 
                                type="file" 
                                style={{ display: 'none' }} 
                                onChange={handleFileInput}
                            />
                            {loading && file ? (
                                <div style={{ color: 'var(--primary-color)' }} className="glitch-anim relative z-10">
                                    [ SCANNING_FILE... ]
                                </div>
                            ) : file ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <UploadCloud color="var(--primary-color)" size={32} />
                                <div style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>FILE_ATTACHED: {file.name}</div>
                                <div 
                                    style={{ 
                                        color: 'var(--secondary-color)', 
                                        cursor: 'pointer', 
                                        marginTop: '10px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '5px' 
                                    }} 
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                >
                                    <X size={16} /> REMOVE
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)' }}>
                                <UploadCloud size={32} style={{ marginBottom: '10px' }} />
                                <div>DRAG & DROP SECURE FILE HERE</div>
                                <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>OR CLICK TO BROWSE</div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6 overflow-visible text-left mt-2">
                        <div className="form-group flex-1 min-w-[150px]">
                            <label className="text-xl font-medium text-slate-400 tracking-wider uppercase mb-2">MAXIMUM_VIEWS</label>
                            <div className="flex items-center bg-[rgba(0,0,0,0.4)] rounded-none px-4 border border-[rgba(255,255,255,0.1)] focus-within:border-[#B45309] transition-colors">
                                <Eye size={18} color="var(--text-muted)" />
                                <input 
                                    type="number" 
                                    className="w-full bg-transparent outline-none text-lg font-mono text-white py-3 px-2" 
                                    value={viewLimit}
                                    onChange={(e) => setViewLimit(e.target.value)}
                                    min="1"
                                    max="100"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-group flex-1 min-w-[150px] overflow-visible">
                            <label className="text-xl font-medium text-slate-400 tracking-wider uppercase mb-2">SELF_DESTRUCT_TIMER</label>
                            <div className="flex gap-2">
                                <input 
                                    type="number"
                                    className="form-control text-lg font-mono flex-1"
                                    value={expiryValue}
                                    onChange={(e) => setExpiryValue(e.target.value)}
                                    min="1"
                                    required
                                />
                                <select 
                                    className="form-control text-lg font-sans flex-1 relative z-50 rounded-none bg-[rgba(0,0,0,0.4)] text-white"
                                    value={expiryUnit}
                                    onChange={(e) => setExpiryUnit(e.target.value)}
                                >
                                    <option value="Minutes">MINUTES</option>
                                    <option value="Hours">HOURS</option>
                                    <option value="Days">DAYS</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <motion.button 
                        type="submit" 
                        className="btn-primary w-full mt-8 py-4 text-xl font-medium tracking-widest bg-[#B45309] text-white" 
                        disabled={loading}
                        whileHover={!loading ? { 
                            scale: 1.02,
                            background: "linear-gradient(90deg, #B45309, #D97706, #B45309)",
                            backgroundSize: "200% 100%",
                            transition: { duration: 0.3 }
                        } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                    >
                        {loading ? 'ENCRYPTING...' : 'INITIALIZE_SECURE_LINK'}
                    </motion.button>
                </form>
                )}

                {generatedLink && (
                    <motion.div 
                        className="link-result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <p style={{ color: 'var(--primary-color)', marginBottom: '0.8rem', fontWeight: 600 }}>[ LINK GENERATED SUCCESSFULLY ]</p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="break-all">{generatedLink}</a>
                            <button 
                                type="button"
                                className="btn-primary py-2 px-4 flex items-center gap-2 whitespace-nowrap mt-0"
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedLink);
                                    showToast('ENCRYPTED_ID: Copied to clipboard.', 'success');
                                }}
                            >
                                <Copy size={16} /> COPY
                            </button>
                        </div>
                        <p style={{ fontSize: '0.85rem', marginTop: '1.5rem', color: 'var(--secondary-color)', fontWeight: 600 }}>
                            WARNING: Key is stored locally in URL hash. Server cannot recover lost keys.
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default CreateSecret;
