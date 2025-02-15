import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorHandler } from '../utils/errorHandler';
import { useAuth } from '../context/AuthContext';

export const useErrorHandler = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleError = useCallback((error, options = {}) => {
    const status = error?.response?.status;

    // Hantera autentiseringsfel
    if (status === 401) {
      logout();
      navigate('/login');
      return ErrorHandler.handle(error, {
        ...options,
        defaultMessage: 'Din session har gått ut. Vänligen logga in igen.'
      });
    }

    // Hantera behörighetsfel
    if (status === 403) {
      navigate('/');
      return ErrorHandler.handle(error, {
        ...options,
        defaultMessage: 'Du har inte behörighet att utföra denna åtgärd.'
      });
    }

    // Hantera 404-fel
    if (status === 404) {
      navigate('/404');
      return ErrorHandler.handle(error, {
        ...options,
        showToast: false
      });
    }

    // Standardhantering för övriga fel
    return ErrorHandler.handle(error, options);
  }, [navigate, logout]);

  return { handleError };
}; 