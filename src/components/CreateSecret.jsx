import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { createSecret } from '../services/api';
import { Shield, Eye, UploadCloud, X } from 'lucide-react';
import { motion } from 'framer-motion';

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
            }

            await createSecret(formData);

            const url = `${window.location.origin}/view/${documentKey}#${aesKey}`;
            setGeneratedLink(url);
            
        } catch (err) {
            setError(err.response?.data?.error || 'System fault: Connection refused.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            className="vault-ui"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
            <div className="glass-panel">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)' }}>
                    <Shield /> SECURE_VAULT_UPLOAD
                </h2>
                
                {error && <div className="alert-message alert-error">{error}</div>}
                
                <form onSubmit={handleCreate}>
                    <div className="form-group">
                        <label>PAYLOAD_DATA</label>
                        <textarea 
                            className="form-control" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter encrypted payload here..."
                            required={!file}
                        />
                    </div>

                    <div 
                        className={`form-group file-dropzone ${isDragging ? 'dragging' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                        onClick={() => document.getElementById('file-upload').click()}
                        style={{
                            border: `2px dashed ${isDragging ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)'}`,
                            background: isDragging ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.2)',
                            borderRadius: '8px',
                            padding: '2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            marginBottom: '1.5rem',
                            position: 'relative'
                        }}
                    >
                        <input 
                            id="file-upload" 
                            type="file" 
                            style={{ display: 'none' }} 
                            onChange={handleFileInput}
                        />
                        {loading && file ? (
                            <div style={{ color: 'var(--primary-color)' }} className="glitch-anim">
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
                    
                    <div style={{ display: 'flex', gap: '1.5rem', flexDirection: 'row', flexWrap: 'wrap', overflow: 'visible' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                            <label>MAXIMUM_VIEWS</label>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '0 1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Eye size={18} color="var(--text-muted)" />
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                                    value={viewLimit}
                                    onChange={(e) => setViewLimit(e.target.value)}
                                    min="1"
                                    max="100"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-group" style={{ flex: 1, minWidth: '150px', overflow: 'visible' }}>
                            <label>SELF_DESTRUCT_TIMER</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    type="number"
                                    className="form-control"
                                    style={{ flex: 1 }}
                                    value={expiryValue}
                                    onChange={(e) => setExpiryValue(e.target.value)}
                                    min="1"
                                    required
                                />
                                <select 
                                    className="form-control"
                                    style={{ flex: 1, position: 'relative', zIndex: 50 }}
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

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'ENCRYPTING...' : 'INITIALIZE_SECURE_LINK'}
                    </button>
                </form>

                {generatedLink && (
                    <motion.div 
                        className="link-result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <p style={{ color: 'var(--primary-color)', marginBottom: '0.8rem', fontWeight: 600 }}>[ LINK GENERATED SUCCESSFULLY ]</p>
                        <a href={generatedLink} target="_blank" rel="noopener noreferrer">{generatedLink}</a>
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
