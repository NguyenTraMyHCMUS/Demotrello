import React from "react";
import { createContext } from "react";
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Logic to fetch and set the authenticated user
    const checkLoggedInUser = async () => {
      try {
        const response = await api.get("/auth/me");
        console.log(response);

        setUser(response.data.user);
      } catch (error) {
        setUser(null);
        console.error("Error checking logged in user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedInUser();
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, setUser, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
