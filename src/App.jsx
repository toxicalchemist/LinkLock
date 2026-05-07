import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import CreateSecret from './components/CreateSecret';
import ViewSecret from './components/ViewSecret';
import Overview from './pages/Admin/Overview';
import SecurityAudit from './pages/Admin/SecurityAudit';
import SystemSettings from './pages/Admin/SystemSettings';
import SplashScreen from './components/SplashScreen';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Login from './pages/Login';
import Register from './pages/Register';
import MyVaults from './pages/MyVaults';
import AdminUsers from './pages/Admin/Users';
import { SnackbarProvider } from './context/SnackbarContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/view/');

  return (
    <div className="flex min-h-screen w-full bg-[#0A0A0A] text-slate-300 font-sans">
      {!isAuthPage && <Sidebar />}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {!isAuthPage && <TopBar />}
        <main className={`flex-1 overflow-y-auto ${!isAuthPage ? 'p-8' : ''}`}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><CreateSecret /></ProtectedRoute>} />
            <Route path="/view/:key" element={<ViewSecret />} />
            <Route path="/admin" element={<ProtectedRoute><AdminRoute><Overview /></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><AdminUsers /></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute><AdminRoute><SecurityAudit /></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminRoute><SystemSettings /></AdminRoute></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/vaults" element={<ProtectedRoute><MyVaults /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <SnackbarProvider>
        <Router>
          <AnimatePresence>
            {loading && <SplashScreen key="splash" />}
          </AnimatePresence>
          <AppLayout />
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
