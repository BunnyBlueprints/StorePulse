import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LogOut, Store as StoreIcon } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';

const App = () => {
  const { user, logout, loading } = useAuth();

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>Loading...</div>;

  return (
    <>
      <nav className="nav-bar">
        <div className="nav-brand">
          <StoreIcon style={{ color: 'var(--accent-color)' }} /> StorePulse
        </div>
        <div>
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Hello, {user.name}</span>
              <button className="btn btn-secondary" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="/login" className="btn btn-secondary">Login</a>
              <a href="/register" className="btn">Register</a>
            </div>
          )}
        </div>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          
          {/* Conditional dashboards based on role */}
          <Route path="/" element={
            !user ? <Navigate to="/login" /> :
            user.role === 'SYSTEM_ADMIN' ? <AdminDashboard /> :
            user.role === 'STORE_OWNER' ? <OwnerDashboard /> :
            <UserDashboard />
          } />
        </Routes>
      </main>
    </>
  );
};

export default App;
