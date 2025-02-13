import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import MonthView from "./components/MonthView";
import Profile from "./components/Profile";
import Navbar from "./components/Navbar";
import PendingTasksManagement from "./components/PendingTasksManagement";
import UserManagement from "./components/UserManagement";

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/dftasks/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/dftasks/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/dftasks/month-view" element={<MonthView />} />
        <Route path="/dftasks/profile" element={<Profile />} />
        <Route
          path="/dftasks/pending-tasks"
          element={<PendingTasksManagement />}
        />
        <Route path="/dftasks/users" element={<UserManagement />} />
        <Route
          path="/dftasks/login"
          element={<Navigate to="/dftasks/month-view" replace />}
        />
        <Route
          path="/dftasks"
          element={<Navigate to="/dftasks/month-view" replace />}
        />
        <Route
          path="/"
          element={<Navigate to="/dftasks/month-view" replace />}
        />
        <Route
          path="*"
          element={<Navigate to="/dftasks/month-view" replace />}
        />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App; 