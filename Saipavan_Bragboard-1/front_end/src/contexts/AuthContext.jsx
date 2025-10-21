import React, { createContext, useState, useContext } from 'react';
import { saveToken, getToken, removeToken } from '../services/authService.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());

  const login = (newToken) => {
    saveToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    removeToken();
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};