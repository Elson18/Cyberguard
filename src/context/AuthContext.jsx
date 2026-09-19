import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [userId, setUserId] = useState(() => localStorage.getItem('user_id') || '');

  useEffect(() => {
    if (username) {
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('username');
    }
  }, [username]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem('user_id', userId);
    } else {
      localStorage.removeItem('user_id');
    }
  }, [userId]);

  const login = (name, id) => {
    setUsername(name);
    setUserId(id || name);
    localStorage.setItem('username', name);
    localStorage.setItem('user_id', id || name);
  };

  const logout = () => {
    setUsername('');
    setUserId('');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
  };

  const isAuthenticated = Boolean(username);

  return (
    <AuthContext.Provider value={{ username, userId, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
