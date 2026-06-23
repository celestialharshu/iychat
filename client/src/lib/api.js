import axios from "axios";

const TOKEN_KEY = "iychat-token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});

// Some mobile browsers (notably iOS Safari/Chrome, which both use WebKit)
// can refuse to persist cross-site cookies even when they're set correctly
// with SameSite=None; Secure. To make auth reliable everywhere, we also
// keep a copy of the JWT in localStorage and send it as a Bearer header
// on every request — the server already accepts either method.
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function saveAuthToken(token) {
  if (typeof window !== "undefined" && token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export default api;
