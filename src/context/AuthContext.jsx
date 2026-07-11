import { useCallback, useState, useEffect } from "react";
import { authService, clearTokens, setTokens } from "../services/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearTokens();
    setLoggedIn(false);
    setUser(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.me();
        setUser(res.data);
        setLoggedIn(true);
      } catch {
        clearTokens();
        setUser(null);
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // The API layer fires this when a refresh attempt fails (session truly expired).
  useEffect(() => {
    window.addEventListener("tf-auth-expired", logout);
    return () => window.removeEventListener("tf-auth-expired", logout);
  }, [logout]);

  const login = async (username, password) => {
    const res = await authService.login({ username, password });
    setTokens(res.data);
    setLoggedIn(true);
    const userRes = await authService.me();
    setUser(userRes.data);
  };

  const register = async (username, email, password) => {
    await authService.register({ username, email, password });
    await login(email, password);
  };

  const updateProfile = async (fields) => {
    const res = await authService.updateMe(fields);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{ login, register, logout, updateProfile, user, loggedIn, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
