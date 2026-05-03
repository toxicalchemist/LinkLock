import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

const SplashScreen = () => {
    return (
        <motion.div 
            className="fixed inset-0 z-[100] bg-[#121212] flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            <motion.div 
                className="flex flex-col items-center justify-center gap-4 w-full"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <motion.img 
                        src={logo} 
                        alt="LinkLock Logo" 
                        className="w-48 h-48 md:w-64 md:h-64 object-contain brightness-0 invert" 
                        initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    <motion.h1 
                        className="text-8xl md:text-9xl font-thin tracking-tighter drop-shadow-md text-slate-50 m-0 leading-none"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        LINKLOCK
                    </motion.h1>
                </div>
                <motion.div 
                    className="font-mono text-slate-400 text-sm md:text-base tracking-widest opacity-80 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, delay: 1 }}
                >
                    {Array.from("V 1.0 (SECURE_INSTANCE)").map((char, i) => (
                        <motion.span 
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.05, delay: 1 + i * 0.05 }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </motion.div>
                
                <div className="mt-16 flex flex-col items-center gap-4 w-80 max-w-[90vw]">
                    <div className="font-mono text-[#F8FAFC] text-sm tracking-widest text-center">INITIALIZING_SECURE_VAULT...</div>
                    <div className="w-full h-1 bg-[#1A1A1A] relative overflow-hidden">
                        <motion.div 
                            className="absolute top-0 left-0 h-full"
                            initial={{ width: "0%", backgroundColor: "#B45309" }}
                            animate={{ width: ["0%", "100%", "100%"], backgroundColor: ["#B45309", "#B45309", "#FFFFFF", "#B45309"] }}
                            transition={{ duration: 2, ease: "linear", times: [0, 0.9, 0.95, 1] }}
                        />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SplashScreen;
