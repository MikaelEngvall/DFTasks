import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthController from '../controllers/authController';
import { TokenService } from '../services/TokenService';

const AuthContext = createContext(null);
const tokenService = new TokenService();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { accessToken } = await AuthController.refreshToken(refreshToken);
          if (accessToken) {
            const decoded = tokenService.verifyToken(accessToken);
            setUser(decoded);
          }
        } catch (error) {
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const result = await AuthController.login(credentials);
    if (result.user) {
      setUser(result.user);
      localStorage.setItem('refreshToken', result.refreshToken);
      return true;
    }
    return false;
  };

  const logout = async () => {
    if (user) {
      await AuthController.logout(user.id);
      setUser(null);
      localStorage.removeItem('refreshToken');
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const result = await AuthController.refreshToken(refreshToken);
      if (result.accessToken) {
        const decoded = tokenService.verifyToken(result.accessToken);
        setUser(decoded);
        return result.accessToken;
      }
    }
    return null;
  };

  if (loading) {
    return <div>Laddar...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth måste användas inom en AuthProvider');
  }
  return context;
}; 