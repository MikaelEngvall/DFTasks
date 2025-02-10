import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import i18next from "i18next";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Funktion för att sätta språk baserat på användarens preferens
  const setUserLanguage = (userData) => {
    if (userData?.preferredLanguage) {
      i18next.changeLanguage(userData.preferredLanguage);
      localStorage.setItem("language", userData.preferredLanguage);
    }
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        setUser(decoded);
        setUserLanguage(decoded);
      }
    } catch (error) {
      console.error("Error parsing token:", error);
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  const login = (token) => {
    try {
      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);
      setUser(decoded);
      setUserLanguage(decoded);
    } catch (error) {
      console.error("Error setting token:", error);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("language");
    setUser(null);
  };

  const updateUser = (userData) => {
    if (user && userData) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      setUserLanguage(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
