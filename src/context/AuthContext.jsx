import { createContext, useContext, useEffect, useState } from "react";
import { login, logout, register, getMe } from "../services/authService";
import {
  getAccessToken,
  getRefreshToken,
  clearTokens,
} from "../services/tokenService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      console.log("initAuth - accessToken:", accessToken ? "exists" : "null");
      console.log("initAuth - refreshToken:", refreshToken ? "exists" : "null");

      if (accessToken || refreshToken) {
        try {
          const userData = await getMe();
          console.log("Session restored:", userData);
          if (userData) {
            setUser(userData);
          } else {
            console.warn("getMe returned null/undefined");
            clearTokens();
          }
        } catch (err) {
          console.warn(
            "Session restore failed:",
            err?.response?.status,
            err?.message,
          );
          clearTokens();
          setUser(null);
        }
      } else {
        console.log("No tokens found, skipping session restore");
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleLogin = async (credentials) => {
    const userData = await login(credentials);
    setUser(userData);
    return userData;
  };

  const handleRegister = async (userData) => {
    const newUser = await register(userData);
    setUser(newUser);
    return newUser;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // still clear local tokens even if server logout fails
    }
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
