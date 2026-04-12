import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext, type User } from './auth-context';

const getStoredToken = () => localStorage.getItem('token');

const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? (JSON.parse(storedUser) as User) : null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};
