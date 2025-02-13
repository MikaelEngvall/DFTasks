import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { usersAPI } from "./services/api";
import { User } from "./types/task";

// Lazy load alla komponenter
const Navbar = lazy(() => import("./components/Navbar"));
const Login = lazy(() => import("./components/Login"));
const MonthView = lazy(() => import("./components/MonthView"));
const Profile = lazy(() => import("./components/Profile"));
const PendingTasksManagement = lazy(() => import("./components/PendingTasksManagement"));
const UserManagement = lazy(() => import("./components/UserManagement"));
const TaskModal = lazy(() => import("./components/TaskModal"));
const TaskForm = lazy(() => import("./components/TaskForm"));
const UserForm = lazy(() => import("./components/UserForm"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-df-primary"></div>
  </div>
);

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await usersAPI.getUsers();
        setUsers(response.data);
      } catch (error) {
        console.error("Fel vid hämtning av användare:", error);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  if (!user) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/dftasks/login" element={<Login />} />
          <Route path="/dftasks/forgot-password" element={<ForgotPassword />} />
          <Route path="/dftasks/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/dftasks/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Navbar />
      <Routes>
        <Route path="/dftasks/month-view" element={<MonthView users={users} />} />
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
    </Suspense>
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