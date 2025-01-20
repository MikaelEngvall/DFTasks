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
import WeekView from "./components/WeekView";
import Navbar from "./components/Navbar";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <Suspense fallback="Loading...">
          <Routes>
            <Route path="/dftasks/login" element={<Login />} />
            <Route
              path="/dftasks/week-view"
              element={
                <ProtectedRoute>
                  <WeekView />
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
      </Router>
    </ThemeProvider>
  );
}

export default App;
