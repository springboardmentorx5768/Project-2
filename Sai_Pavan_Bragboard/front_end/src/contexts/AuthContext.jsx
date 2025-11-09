import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { getCurrentUser } from "../api/apiService"; // Import the API service

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoize the logout function to stabilize its identity
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await getCurrentUser();
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user, logging out.", error);
          // If the token is invalid (e.g., expired), log the user out
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token, logout]); // Add logout to the dependency array

  // Memoize the login function
  const login = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }, []);

  const isAuthenticated = !!token;

  // Don't render the rest of the app until the initial auth check is complete
  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

