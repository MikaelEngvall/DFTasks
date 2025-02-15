import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Navbar from '../components/Navbar';

// Lazy loading av komponenter
const Login = React.lazy(() => import('../components/Login'));
const MonthView = React.lazy(() => import('../components/MonthView'));
const Profile = React.lazy(() => import('../components/Profile'));
const PendingTasksManagement = React.lazy(() => import('../components/PendingTasksManagement'));
const UserManagement = React.lazy(() => import('../components/UserManagement'));

const AppRoutes = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dftasks/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/dftasks/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route 
            path="/dftasks/month-view" 
            element={
              <ProtectedRoute>
                <MonthView />
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
    </>
  );
};

export default AppRoutes; 