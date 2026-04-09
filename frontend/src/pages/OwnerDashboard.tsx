import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Star, MessageSquare } from 'lucide-react';

const OwnerDashboard = () => {
    const [ratings, setRatings] = useState<any[]>([]);
    
    const fetchRatings = async () => {
        try {
            const res = await api.get('/ratings/store/my');
            setRatings(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRatings();
    }, []);

    const averageRating = ratings.length > 0 
        ? (ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length).toFixed(1) 
        : '0.0';

    return (
        <div className="animated">
            <h1 style={{ marginBottom: '2rem' }}>Store Analytics</h1>
            
            <div className="glass-card" style={{ display: 'inline-flex', alignItems: 'center', gap: '2rem', padding: '2rem 3rem', marginBottom: '3rem' }}>
                <div style={{ padding: '1.5rem', background: 'rgba(241, 196, 15, 0.1)', borderRadius: '50%', color: '#f1c40f' }}>
                    <Star size={48} />
                </div>
                <div>
                    <div style={{ fontSize: '3rem', fontWeight: 700, color: '#f1c40f', lineHeight: 1 }}>{averageRating}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                        Average Rating ({ratings.length} reviews)
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageSquare /> Customer Reviews
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {ratings.length === 0 ? (
                        <div style={{ color: 'var(--text-secondary)' }}>No ratings yet.</div>
                    ) : (
                        ratings.map(r => (
                            <div key={r.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--accent-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong>{r.user?.name || 'Anonymous User'}</strong>
                                    <span style={{ color: '#f1c40f', fontWeight: 600 }}>★ {r.score}/5</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {new Date(r.createdAt).toLocaleDateString()} • {r.user?.email}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
