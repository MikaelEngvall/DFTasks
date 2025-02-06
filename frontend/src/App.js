import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MonthView from "./components/MonthView";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
          <ErrorBoundary>
            <Navbar />
            <Suspense fallback="Loading...">
              <Routes>
                <Route path="/dftasks/login" element={<Login />} />
                <Route
                  path="/dftasks/week-view"
                  element={
                    <ProtectedRoute>
                      <MonthView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dftasks/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
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
    </LanguageProvider>
  );
}

export default App;
