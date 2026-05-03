import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import CreateSecret from './components/CreateSecret';
import ViewSecret from './components/ViewSecret';
import Dashboard from './pages/Admin/Dashboard';
import SplashScreen from './components/SplashScreen';
import { SnackbarProvider } from './context/SnackbarContext';
import logo from './assets/logo.png'; // Make sure to save your logo here!

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SnackbarProvider>
      <Router>
        <AnimatePresence>
          {loading && <SplashScreen key="splash" />}
        </AnimatePresence>
        <div className="app-container flex flex-col items-center justify-start min-h-screen w-full">
          <div className="flex flex-col items-center justify-center pt-8 pb-12 gap-4 w-full">
            <div className="relative flex items-center justify-center w-full">
              <div className="relative flex items-center justify-center">
                <div className="absolute right-full mr-4 flex items-center justify-center">
                  <motion.img 
                    src={logo} 
                    alt="LinkLock Logo" 
                    className="w-20 h-20 md:w-28 md:h-28 object-contain brightness-0 invert" 
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <h1 className="text-6xl md:text-8xl font-thin tracking-tighter drop-shadow-md text-slate-50 m-0 leading-tight text-center">
                  LINKLOCK
                </h1>
              </div>
            </div>
            <div className="font-mono text-slate-400 text-sm md:text-base tracking-widest opacity-80 text-center">
              V 1.0 (SECURE_INSTANCE)
            </div>
          </div>
          <Routes>
            <Route path="/" element={<CreateSecret />} />
            <Route path="/view/:key" element={<ViewSecret />} />
            <Route path="/admin" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </SnackbarProvider>
  );
}

export default App;
