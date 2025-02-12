import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MonthView from "./components/MonthView";
import PendingTasksManagement from "./components/PendingTasksManagement";
import UserManagement from "./components/UserManagement";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";

// Skapa en separat komponent för routes för att kunna använda useAuth
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/dftasks/login" element={<Login />} />
      <Route path="/dftasks/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/dftasks/reset-password/:token"
        element={<ResetPassword />}
      />
      <Route
        path="/dftasks/month-view"
        element={
          <ProtectedRoute>
            <MonthView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dftasks/pending-tasks"
        element={
          <ProtectedRoute adminOnly>
            <PendingTasksManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dftasks/users"
        element={
          <ProtectedRoute adminOnly>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dftasks/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dftasks"
        element={
          user ? (
            <Navigate to="/dftasks/month-view" replace />
          ) : (
            <Navigate to="/dftasks/login" replace />
          )
        }
      />
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dftasks/month-view" replace />
          ) : (
            <Navigate to="/dftasks/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={
          user ? (
            <Navigate to="/dftasks/month-view" replace />
          ) : (
            <Navigate to="/dftasks/login" replace />
          )
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ErrorBoundary>
            <Navbar />
            <Suspense fallback="Loading...">
              <AppRoutes />
            </Suspense>
          </ErrorBoundary>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
