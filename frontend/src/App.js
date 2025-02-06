import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import UserDashboard from "./components/UserDashboard";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MonthView from "./components/MonthView";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ErrorBoundary>
          <Navbar />
          <Suspense fallback="Loading...">
            <Routes>
              <Route path="/dftasks/login" element={<Login />} />
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
  );
}

export default App;
