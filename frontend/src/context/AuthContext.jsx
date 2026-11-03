import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

const ROLE_PRESETS = {
  Coordinator: { email: 'coordinator@campus.edu', password: 'Admin@123' },
  'Venue Team': { email: 'venue@campus.edu', password: 'Venue@123' },
  'Technical Team': { email: 'tech@campus.edu', password: 'Tech@123' },
  'Volunteer Team': { email: 'volunteer@campus.edu', password: 'Volunteer@123' },
  'Security Team': { email: 'security@campus.edu', password: 'Security@123' },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (err) {
          console.warn('[AuthContext] Session invalid:', err.message);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.data) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.data) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Quick switch between the 5 standard campus roles for demo & testing
  const quickSwitchRole = async (targetRole) => {
    const credentials = ROLE_PRESETS[targetRole];
    if (credentials) {
      return await login(credentials.email, credentials.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        loading,
        login,
        register,
        logout,
        quickSwitchRole,
        ROLE_PRESETS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
