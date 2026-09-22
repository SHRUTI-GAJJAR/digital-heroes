import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing login when the app starts
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("digitalHeroesToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        if (response.data?.success) {
          setUser(response.data.user);
          localStorage.setItem(
            "digitalHeroesUser",
            JSON.stringify(response.data.user)
          );
        }
      } catch (error) {
        console.error("Session check failed:", error);

        localStorage.removeItem("digitalHeroesToken");
        localStorage.removeItem("digitalHeroesUser");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const clearSession = () => setUser(null);
    window.addEventListener("digitalheroes:unauthorized", clearSession);
    return () => window.removeEventListener("digitalheroes:unauthorized", clearSession);
  }, []);

  // Login
  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Unable to sign in. Please try again.");
    }

    const { token, user } = response.data;

    localStorage.setItem("digitalHeroesToken", token);
    localStorage.setItem("digitalHeroesUser", JSON.stringify(user));

    setUser(user);

    return user;
  };

  // Register
  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "We couldn’t create your account. Please try again.");
    }

    const { token, user } = response.data;

    localStorage.setItem("digitalHeroesToken", token);
    localStorage.setItem("digitalHeroesUser", JSON.stringify(user));

    setUser(user);

    return user;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("digitalHeroesToken");
    localStorage.removeItem("digitalHeroesUser");

    setUser(null);
  };

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === "admin";

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
