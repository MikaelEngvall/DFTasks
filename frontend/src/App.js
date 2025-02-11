import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
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
              <Routes>
                <Route path="/dftasks/login" element={<Login />} />
                <Route
                  path="/dftasks/forgot-password"
                  element={<ForgotPassword />}
                />
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
                  element={<Navigate to="/dftasks/login" replace />}
                />
                <Route
                  path="/"
                  element={<Navigate to="/dftasks/login" replace />}
                />
                <Route
                  path="*"
                  element={<Navigate to="/dftasks/login" replace />}
                />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
