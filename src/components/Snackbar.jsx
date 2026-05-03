import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Snackbar = ({ toast }) => {
    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 100 }}
                        animate={toast.type === 'burn' ? { opacity: [0, 1, 0.5, 1], x: 0, backgroundColor: ['#121212', '#991B1B', '#121212'] } : { opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.5 }}
                        className={`min-w-[300px] p-4 bg-[#121212] border-l-4 rounded-none shadow-none font-sans text-sm tracking-wide flex items-center justify-start pointer-events-auto text-[#F8FAFC] ${
                            (toast.type === 'error' || toast.type === 'burn')
                                ? 'border-[#991B1B]' 
                                : 'border-[#B45309]'
                        }`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Snackbar;
