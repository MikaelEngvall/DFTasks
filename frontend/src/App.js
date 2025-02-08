import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import UserDashboard from "./components/UserDashboard";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import MonthView from "./components/MonthView";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
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
                  path="/dftasks/admin"
                  element={<Navigate to="/dftasks/dashboard" replace />}
                />
                <Route
                  path="/dftasks/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
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
