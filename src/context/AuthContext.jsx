import { useState, useEffect, createContext, useContext } from "react";
import { authService } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        localStorage.removeItem("token");
        setUser(null);
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await authService.login({ username, password });
    localStorage.setItem("token", res.data.access_token);
    setLoggedIn(true);
    const userRes = await authService.me();
    setUser(userRes.data);
  };

  const register = async (username, email, password) => {
    await authService.register({ username, email, password });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ login, register, logout, user, loggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
