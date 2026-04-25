import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateSecret from './components/CreateSecret';
import ViewSecret from './components/ViewSecret';
import Dashboard from './pages/Admin/Dashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
        <h1 className="header-title">LinkLock</h1>
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
