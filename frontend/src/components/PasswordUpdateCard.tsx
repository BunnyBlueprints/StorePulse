import { useState } from 'react';
import axios from 'axios';
import api from '../lib/api';

interface PasswordUpdateCardProps {
  title: string;
}

const PasswordUpdateCard = ({ title }: PasswordUpdateCardProps) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.put('/auth/password', { oldPassword, newPassword });
      setMessage(response.data.message || 'Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || error.response?.data?.error || 'Failed to update password.');
      } else {
        setError('Failed to update password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card">
      <h2 style={{ marginBottom: '1.5rem' }}>{title}</h2>
      {message ? <div className="status-success">{message}</div> : null}
      {error ? <div className="status-error">{error}</div> : null}
      <form className="stack-md" onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Current Password</label>
          <input
            className="form-input"
            type="password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            required
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>New Password</label>
          <input
            className="form-input"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            minLength={8}
            maxLength={16}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Confirm New Password</label>
          <input
            className="form-input"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
            maxLength={16}
          />
        </div>
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default PasswordUpdateCard;
