import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateSecret from './components/CreateSecret';
import ViewSecret from './components/ViewSecret';
import Dashboard from './pages/Admin/Dashboard';
import logo from './assets/logo.png'; // Make sure to save your logo here!

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="header-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '20px 0' }}>
          <img src={logo} alt="LinkLock Logo" style={{ width: '120px', height: '120px', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))' }} />
          <h1 className="header-title" style={{ margin: 0, fontSize: '3rem' }}>LinkLock</h1>
        </div>
        <Routes>
          <Route path="/" element={<CreateSecret />} />
          <Route path="/view/:key" element={<ViewSecret />} />
          <Route path="/admin" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
