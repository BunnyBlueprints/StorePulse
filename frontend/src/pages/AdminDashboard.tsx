import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import api from '../lib/api';
import { Users, Store as StoreIcon, Star, ArrowUpDown, Eye } from 'lucide-react';

type Role = 'SYSTEM_ADMIN' | 'NORMAL_USER' | 'STORE_OWNER';
type SortOrder = 'asc' | 'desc';

interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

interface StoreSummary {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number;
}

interface UserSummary {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
  store: {
    id: string;
    name: string;
    averageRating: number;
  } | null;
}

interface UserDetails extends UserSummary {
  createdAt: string;
  updatedAt: string;
}

interface UserFormState {
  name: string;
  email: string;
  password: string;
  address: string;
  role: Role;
}

interface StoreFormState {
  name: string;
  email: string;
  address: string;
  ownerId: string;
}

interface UserFilters {
  name: string;
  email: string;
  address: string;
  role: string;
}

interface StoreFilters {
  name: string;
  email: string;
  address: string;
}

const emptyUserForm: UserFormState = {
  name: '',
  email: '',
  password: '',
  address: '',
  role: 'NORMAL_USER'
};

const emptyStoreForm: StoreFormState = {
  name: '',
  email: '',
  address: '',
  ownerId: ''
};

const emptyUserFilters: UserFilters = {
  name: '',
  email: '',
  address: '',
  role: ''
};

const emptyStoreFilters: StoreFilters = {
  name: '',
  email: '',
  address: ''
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [userForm, setUserForm] = useState<UserFormState>(emptyUserForm);
  const [storeForm, setStoreForm] = useState<StoreFormState>(emptyStoreForm);
  const [userFilters, setUserFilters] = useState<UserFilters>(emptyUserFilters);
  const [storeFilters, setStoreFilters] = useState<StoreFilters>(emptyStoreFilters);
  const [userSort, setUserSort] = useState<{ field: keyof UserSummary; order: SortOrder }>({ field: 'name', order: 'asc' });
  const [storeSort, setStoreSort] = useState<{ field: keyof StoreSummary; order: SortOrder }>({ field: 'name', order: 'asc' });
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [detailsError, setDetailsError] = useState('');
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);

  const ownerOptions = useMemo(
    () => users.filter((user) => user.role === 'STORE_OWNER' && !user.store),
    [users]
  );

  const getErrorMessage = useCallback((error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.response?.data?.error || fallback;
    }
    return fallback;
  }, []);

  const fetchStats = useCallback(async () => {
    const response = await api.get<DashboardStats>('/users/dashboard-stats');
    setStats(response.data);
  }, []);

  const fetchUsers = useCallback(async () => {
    const response = await api.get<UserSummary[]>('/users', {
      params: {
        ...userFilters,
        role: userFilters.role || undefined,
        sortField: userSort.field,
        sortOrder: userSort.order
      }
    });
    setUsers(response.data);
  }, [userFilters, userSort]);

  const fetchStores = useCallback(async () => {
    const response = await api.get<StoreSummary[]>('/stores', {
      params: {
        ...storeFilters,
        sortField: storeSort.field,
        sortOrder: storeSort.order
      }
    });
    setStores(response.data);
  }, [storeFilters, storeSort]);

  useEffect(() => {
    void fetchStats().catch((error) => setErrorMessage(getErrorMessage(error, 'Failed to load dashboard stats.')));
  }, [fetchStats, getErrorMessage]);

  useEffect(() => {
    void fetchUsers().catch((error) => setErrorMessage(getErrorMessage(error, 'Failed to load users.')));
  }, [fetchUsers, getErrorMessage]);

  useEffect(() => {
    void fetchStores().catch((error) => setErrorMessage(getErrorMessage(error, 'Failed to load stores.')));
  }, [fetchStores, getErrorMessage]);

  const refreshAll = async () => {
    await Promise.all([fetchStats(), fetchUsers(), fetchStores()]);
  };

  const handleUserSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage('');
    setErrorMessage('');

    try {
      await api.post('/users', userForm);
      setStatusMessage('User created successfully.');
      setUserForm(emptyUserForm);
      await refreshAll();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to create user.'));
    }
  };

  const handleStoreSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage('');
    setErrorMessage('');

    try {
      await api.post('/stores', {
        ...storeForm,
        ownerId: storeForm.ownerId || undefined
      });
      setStatusMessage('Store created successfully.');
      setStoreForm(emptyStoreForm);
      await refreshAll();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to create store.'));
    }
  };

  const loadUserDetails = async (userId: string) => {
    setDetailsError('');
    setLoadingDetailsId(userId);

    try {
      const response = await api.get<UserDetails>(`/users/${userId}`);
      setSelectedUser(response.data);
    } catch (error) {
      setSelectedUser(null);
      setDetailsError(getErrorMessage(error, 'Failed to load user details.'));
    } finally {
      setLoadingDetailsId(null);
    }
  };

  const toggleUserSort = (field: keyof UserSummary) => {
    setUserSort((current) => ({
      field,
      order: current.field === field && current.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleStoreSort = (field: keyof StoreSummary) => {
    setStoreSort((current) => ({
      field,
      order: current.field === field && current.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="animated stack-xl">
      <h1>System Dashboard</h1>

      {statusMessage ? <div className="status-success">{statusMessage}</div> : null}
      {errorMessage ? <div className="status-error">{errorMessage}</div> : null}

      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-icon">
            <Users size={32} />
          </div>
          <div>
            <div className="metric-value">{stats.totalUsers}</div>
            <div className="metric-label">Total Users</div>
          </div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-icon">
            <StoreIcon size={32} />
          </div>
          <div>
            <div className="metric-value">{stats.totalStores}</div>
            <div className="metric-label">Total Stores</div>
          </div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-icon">
            <Star size={32} />
          </div>
          <div>
            <div className="metric-value">{stats.totalRatings}</div>
            <div className="metric-label">Total Ratings</div>
          </div>
        </div>
      </div>

      <div className="split-grid">
        <div className="glass-card">
          <h2 style={{ marginBottom: '1.5rem' }}>Add User</h2>
          <form className="stack-md" onSubmit={handleUserSubmit}>
            <input className="form-input" placeholder="Name" value={userForm.name} onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))} required />
            <input className="form-input" placeholder="Email" type="email" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} required />
            <input className="form-input" placeholder="Password" type="password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} required minLength={8} maxLength={16} />
            <input className="form-input" placeholder="Address" value={userForm.address} onChange={(event) => setUserForm((current) => ({ ...current, address: event.target.value }))} required />
            <select className="form-input" value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value as Role }))}>
              <option value="NORMAL_USER">Normal User</option>
              <option value="SYSTEM_ADMIN">System Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
            <button className="btn" type="submit">Create User</button>
          </form>
        </div>

        <div className="glass-card">
          <h2 style={{ marginBottom: '1.5rem' }}>Add Store</h2>
          <form className="stack-md" onSubmit={handleStoreSubmit}>
            <input className="form-input" placeholder="Store Name" value={storeForm.name} onChange={(event) => setStoreForm((current) => ({ ...current, name: event.target.value }))} required />
            <input className="form-input" placeholder="Store Email" type="email" value={storeForm.email} onChange={(event) => setStoreForm((current) => ({ ...current, email: event.target.value }))} required />
            <input className="form-input" placeholder="Store Address" value={storeForm.address} onChange={(event) => setStoreForm((current) => ({ ...current, address: event.target.value }))} required />
            <select className="form-input" value={storeForm.ownerId} onChange={(event) => setStoreForm((current) => ({ ...current, ownerId: event.target.value }))}>
              <option value="">Unassigned owner</option>
              {ownerOptions.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            <button className="btn" type="submit">Create Store</button>
          </form>
        </div>
      </div>

      <div className="glass-card stack-lg">
        <div className="section-header">
          <h2>User Listing</h2>
          <button className="btn btn-secondary" type="button" onClick={() => setUserFilters(emptyUserFilters)}>
            Clear Filters
          </button>
        </div>
        <div className="filters-grid">
          <input className="form-input" placeholder="Filter by name" value={userFilters.name} onChange={(event) => setUserFilters((current) => ({ ...current, name: event.target.value }))} />
          <input className="form-input" placeholder="Filter by email" value={userFilters.email} onChange={(event) => setUserFilters((current) => ({ ...current, email: event.target.value }))} />
          <input className="form-input" placeholder="Filter by address" value={userFilters.address} onChange={(event) => setUserFilters((current) => ({ ...current, address: event.target.value }))} />
          <select className="form-input" value={userFilters.role} onChange={(event) => setUserFilters((current) => ({ ...current, role: event.target.value }))}>
            <option value="">All roles</option>
            <option value="NORMAL_USER">Normal User</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th><button className="sort-button" type="button" onClick={() => toggleUserSort('name')}><ArrowUpDown size={14} /> Name</button></th>
                <th><button className="sort-button" type="button" onClick={() => toggleUserSort('email')}><ArrowUpDown size={14} /> Email</button></th>
                <th><button className="sort-button" type="button" onClick={() => toggleUserSort('address')}><ArrowUpDown size={14} /> Address</button></th>
                <th><button className="sort-button" type="button" onClick={() => toggleUserSort('role')}><ArrowUpDown size={14} /> Role</button></th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.address}</td>
                  <td>{user.role.replace('_', ' ')}</td>
                  <td>
                    <button className="btn btn-secondary inline-button" type="button" onClick={() => void loadUserDetails(user.id)} disabled={loadingDetailsId === user.id}>
                      <Eye size={14} /> {loadingDetailsId === user.id ? 'Loading...' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card stack-lg">
        <div className="section-header">
          <h2>Store Listing</h2>
          <button className="btn btn-secondary" type="button" onClick={() => setStoreFilters(emptyStoreFilters)}>
            Clear Filters
          </button>
        </div>
        <div className="filters-grid">
          <input className="form-input" placeholder="Filter by name" value={storeFilters.name} onChange={(event) => setStoreFilters((current) => ({ ...current, name: event.target.value }))} />
          <input className="form-input" placeholder="Filter by email" value={storeFilters.email} onChange={(event) => setStoreFilters((current) => ({ ...current, email: event.target.value }))} />
          <input className="form-input" placeholder="Filter by address" value={storeFilters.address} onChange={(event) => setStoreFilters((current) => ({ ...current, address: event.target.value }))} />
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th><button className="sort-button" type="button" onClick={() => toggleStoreSort('name')}><ArrowUpDown size={14} /> Name</button></th>
                <th><button className="sort-button" type="button" onClick={() => toggleStoreSort('email')}><ArrowUpDown size={14} /> Email</button></th>
                <th><button className="sort-button" type="button" onClick={() => toggleStoreSort('address')}><ArrowUpDown size={14} /> Address</button></th>
                <th><button className="sort-button" type="button" onClick={() => toggleStoreSort('averageRating')}><ArrowUpDown size={14} /> Rating</button></th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.email}</td>
                  <td>{store.address}</td>
                  <td>{store.averageRating.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card">
        <h2 style={{ marginBottom: '1rem' }}>User Details</h2>
        {detailsError ? <div className="status-error">{detailsError}</div> : null}
        {!selectedUser ? (
          <div className="empty-state">Select a user from the listing to view full details.</div>
        ) : (
          <div className="details-grid">
            <div><span className="details-label">Name</span><div>{selectedUser.name}</div></div>
            <div><span className="details-label">Email</span><div>{selectedUser.email}</div></div>
            <div><span className="details-label">Address</span><div>{selectedUser.address}</div></div>
            <div><span className="details-label">Role</span><div>{selectedUser.role.replace('_', ' ')}</div></div>
            <div><span className="details-label">Created</span><div>{new Date(selectedUser.createdAt).toLocaleString()}</div></div>
            <div><span className="details-label">Updated</span><div>{new Date(selectedUser.updatedAt).toLocaleString()}</div></div>
            {selectedUser.role === 'STORE_OWNER' ? (
              <div>
                <span className="details-label">Store Rating</span>
                <div>{selectedUser.store ? selectedUser.store.averageRating.toFixed(1) : 'No store assigned'}</div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
