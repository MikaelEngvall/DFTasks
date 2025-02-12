import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import i18next from "i18next";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Funktion för att sätta språk baserat på användarens preferens
  const setUserLanguage = (userData) => {
    if (userData?.preferredLanguage) {
      i18next.changeLanguage(userData.preferredLanguage);
      localStorage.setItem("language", userData.preferredLanguage);
      document.documentElement.lang = userData.preferredLanguage;
    } else {
      // Om ingen preferredLanguage finns, använd engelska som standard
      i18next.changeLanguage("en");
      localStorage.setItem("language", "en");
      document.documentElement.lang = "en";
    }
  };

  // Kontrollera token vid sidladdning
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);
          // Kontrollera om token har gått ut
          if (decoded.exp * 1000 > Date.now()) {
            setUser(decoded);
            setUserLanguage(decoded);
          } else {
            localStorage.removeItem("token");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
