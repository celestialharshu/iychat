"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api, { saveAuthToken, clearAuthToken } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // on first load, check if a valid session (cookie OR stored token) exists
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    // store the token ourselves — some mobile browsers (iOS Safari/Chrome)
    // can silently drop cross-site cookies, so we don't rely on the cookie
    // alone to keep someone logged in
    saveAuthToken(res.data.token);
    setUser(res.data);
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });
    saveAuthToken(res.data.token);
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    clearAuthToken();
    setUser(null);
  };

  // Merge a saved profile change (new photo, new name) into the user we're
  // already holding. Everything that draws your avatar reads it from here, so
  // one call updates the rail, the header and your own profile page at once.
  const applyProfile = (changes) => {
    setUser((current) => ({ ...current, ...changes }));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, applyProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
