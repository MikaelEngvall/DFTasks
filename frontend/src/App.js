import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <Suspense fallback="Loading...">
        <Router basename="/dftasks">
          <Routes>
            {/* Omdirigera root till login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="USER">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fånga alla andra routes och omdirigera till login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
