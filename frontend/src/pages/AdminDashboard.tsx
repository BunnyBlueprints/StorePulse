import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Users, Store as StoreIcon, Star } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
    const [users, setUsers] = useState<any[]>([]);
    
    const fetchStats = async () => {
        try {
            const res = await api.get('/users/dashboard-stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, []);

    return (
        <div className="animated">
            <h1 style={{ marginBottom: '2rem' }}>System Dashboard</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(88, 166, 255, 0.1)', borderRadius: '50%', color: 'var(--accent-color)' }}>
                        <Users size={32} />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalUsers}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Total Users</div>
                    </div>
                </div>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(88, 166, 255, 0.1)', borderRadius: '50%', color: 'var(--accent-color)' }}>
                        <StoreIcon size={32} />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalStores}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Total Stores</div>
                    </div>
                </div>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(88, 166, 255, 0.1)', borderRadius: '50%', color: 'var(--accent-color)' }}>
                        <Star size={32} />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalRatings}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Total Ratings</div>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>User Directory</h2>
                    {/* Add Store/User buttons could go here */}
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '1rem' }}>Name</th>
                                <th style={{ padding: '1rem' }}>Email</th>
                                <th style={{ padding: '1rem' }}>Role</th>
                                <th style={{ padding: '1rem' }}>Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>{u.name}</td>
                                    <td style={{ padding: '1rem', color: 'var(--accent-color)' }}>{u.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}>
                                            {u.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.address.substring(0, 40)}{u.address.length > 40 ? '...' : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
