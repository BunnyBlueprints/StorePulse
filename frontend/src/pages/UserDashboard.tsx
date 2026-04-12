import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../lib/api';
import { Search, ArrowUpDown } from 'lucide-react';
import PasswordUpdateCard from '../components/PasswordUpdateCard';

type SortField = 'name' | 'address' | 'averageRating';
type SortOrder = 'asc' | 'desc';

interface StoreRow {
  id: string;
  name: string;
  address: string;
  averageRating: number;
  myRating: number | null;
  myRatingId: string | null;
}

const UserDashboard = () => {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchStores = async () => {
    const response = await api.get<StoreRow[]>('/stores', {
      params: {
        name: searchName || undefined,
        address: searchAddress || undefined,
        sortField,
        sortOrder
      }
    });
    setStores(response.data);
  };

  useEffect(() => {
    let active = true;

    const loadStores = async () => {
      try {
        const response = await api.get<StoreRow[]>('/stores', {
          params: {
            name: searchName || undefined,
            address: searchAddress || undefined,
            sortField,
            sortOrder
          }
        });

        if (active) {
          setStores(response.data);
          setError('');
        }
      } catch (error) {
        if (!active) return;
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || error.response?.data?.error || 'Failed to load stores.');
        } else {
          setError('Failed to load stores.');
        }
      }
    };

    void loadStores();

    return () => {
      active = false;
    };
  }, [searchName, searchAddress, sortField, sortOrder]);

  const startEditing = (store: StoreRow) => {
    setEditingStoreId(store.id);
    setRatingScore(store.myRating ?? 5);
    setMessage('');
    setError('');
  };

  const submitRating = async (store: StoreRow) => {
    setMessage('');
    setError('');

    try {
      if (store.myRatingId) {
        await api.put(`/ratings/${store.myRatingId}`, { score: ratingScore });
        setMessage(`Updated rating for ${store.name}.`);
      } else {
        await api.post('/ratings', { storeId: store.id, score: ratingScore });
        setMessage(`Submitted rating for ${store.name}.`);
      }
      setEditingStoreId(null);
      await fetchStores();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || error.response?.data?.error || 'Failed to save rating.');
      } else {
        setError('Failed to save rating.');
      }
    }
  };

  const toggleSort = (field: SortField) => {
    setSortOrder((currentOrder) => (sortField === field && currentOrder === 'asc' ? 'desc' : 'asc'));
    setSortField(field);
  };

  return (
    <div className="animated stack-xl">
      <div className="section-header">
        <h1>Store Directory</h1>
        <div className="search-grid">
          <div className="search-input">
            <Search size={18} />
            <input className="form-input" type="text" placeholder="Search by store name" value={searchName} onChange={(event) => setSearchName(event.target.value)} />
          </div>
          <div className="search-input">
            <Search size={18} />
            <input className="form-input" type="text" placeholder="Search by address" value={searchAddress} onChange={(event) => setSearchAddress(event.target.value)} />
          </div>
        </div>
      </div>

      {message ? <div className="status-success">{message}</div> : null}
      {error ? <div className="status-error">{error}</div> : null}

      <div className="glass-card stack-lg">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th><button className="sort-button" type="button" onClick={() => toggleSort('name')}><ArrowUpDown size={14} /> Store Name</button></th>
                <th><button className="sort-button" type="button" onClick={() => toggleSort('address')}><ArrowUpDown size={14} /> Address</button></th>
                <th><button className="sort-button" type="button" onClick={() => toggleSort('averageRating')}><ArrowUpDown size={14} /> Overall Rating</button></th>
                <th>Your Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.address}</td>
                  <td>{store.averageRating.toFixed(1)}</td>
                  <td>{store.myRating ?? '-'}</td>
                  <td>
                    {editingStoreId === store.id ? (
                      <div className="inline-editor">
                        <input
                          className="form-input"
                          type="number"
                          min="1"
                          max="5"
                          value={ratingScore}
                          onChange={(event) => setRatingScore(Number(event.target.value))}
                        />
                        <button className="btn inline-button" type="button" onClick={() => void submitRating(store)}>Save</button>
                        <button className="btn btn-secondary inline-button" type="button" onClick={() => setEditingStoreId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn btn-secondary inline-button" type="button" onClick={() => startEditing(store)}>
                        {store.myRatingId ? 'Modify Rating' : 'Rate Store'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PasswordUpdateCard title="Update Password" />
    </div>
  );
};

export default UserDashboard;
