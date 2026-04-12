import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import api from '../lib/api';
import { Star, MessageSquare, ArrowUpDown } from 'lucide-react';
import PasswordUpdateCard from '../components/PasswordUpdateCard';

type SortField = 'name' | 'email' | 'score' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface RatingRow {
  id: string;
  score: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

const OwnerDashboard = () => {
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [error, setError] = useState('');

  useEffect(() => {
    void api.get<RatingRow[]>('/ratings/store/my')
      .then((response) => setRatings(response.data))
      .catch((error) => {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || error.response?.data?.error || 'Failed to load ratings.');
        } else {
          setError('Failed to load ratings.');
        }
      });
  }, []);

  const sortedRatings = useMemo(() => {
    const value = [...ratings];
    value.sort((left, right) => {
      const leftValue =
        sortField === 'name' ? left.user.name :
        sortField === 'email' ? left.user.email :
        sortField === 'score' ? left.score :
        left.createdAt;
      const rightValue =
        sortField === 'name' ? right.user.name :
        sortField === 'email' ? right.user.email :
        sortField === 'score' ? right.score :
        right.createdAt;

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return sortOrder === 'asc' ? leftValue - rightValue : rightValue - leftValue;
      }

      return sortOrder === 'asc'
        ? String(leftValue).localeCompare(String(rightValue))
        : String(rightValue).localeCompare(String(leftValue));
    });
    return value;
  }, [ratings, sortField, sortOrder]);

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length).toFixed(1)
    : '0.0';

  const toggleSort = (field: SortField) => {
    setSortOrder((currentOrder) => (sortField === field && currentOrder === 'asc' ? 'desc' : 'asc'));
    setSortField(field);
  };

  return (
    <div className="animated stack-xl">
      <h1>Store Analytics</h1>
      {error ? <div className="status-error">{error}</div> : null}

      <div className="glass-card metric-card" style={{ maxWidth: '420px' }}>
        <div className="metric-icon" style={{ color: '#f1c40f', background: 'rgba(241, 196, 15, 0.12)' }}>
          <Star size={40} />
        </div>
        <div>
          <div className="metric-value" style={{ color: '#f1c40f' }}>{averageRating}</div>
          <div className="metric-label">Average Rating ({ratings.length} reviews)</div>
        </div>
      </div>

      <div className="glass-card stack-lg">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} /> Customer Reviews
        </h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th><button className="sort-button" type="button" onClick={() => toggleSort('name')}><ArrowUpDown size={14} /> Name</button></th>
                <th><button className="sort-button" type="button" onClick={() => toggleSort('email')}><ArrowUpDown size={14} /> Email</button></th>
                <th><button className="sort-button" type="button" onClick={() => toggleSort('score')}><ArrowUpDown size={14} /> Rating</button></th>
                <th><button className="sort-button" type="button" onClick={() => toggleSort('createdAt')}><ArrowUpDown size={14} /> Submitted</button></th>
              </tr>
            </thead>
            <tbody>
              {sortedRatings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-cell">No ratings yet.</td>
                </tr>
              ) : (
                sortedRatings.map((rating) => (
                  <tr key={rating.id}>
                    <td>{rating.user.name}</td>
                    <td>{rating.user.email}</td>
                    <td>{rating.score}/5</td>
                    <td>{new Date(rating.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PasswordUpdateCard title="Update Password" />
    </div>
  );

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
