import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/signup', formData);
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      if (Array.isArray(err.response?.data?.error)) {
          setError(err.response.data.error[0].message);
      } else {
          setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated" style={{ maxWidth: '500px', margin: '4rem auto' }}>
      <div className="glass-card">
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <UserPlus /> Register
        </h2>
        
        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name (20 to 60 characters)</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required minLength={20} maxLength={60} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Address (max 400 characters)</label>
            <input type="text" name="address" className="form-input" value={formData.address} onChange={handleChange} required maxLength={400} />
          </div>
          <div className="form-group">
            <label>Password (8-16 chars, 1 uppercase, 1 special)</label>
            <input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} required minLength={8} maxLength={16} />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
