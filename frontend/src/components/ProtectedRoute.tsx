import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/dftasks/login" replace />;
  }

  if (adminOnly && !(user.role === "ADMIN" || user.role === "SUPERADMIN")) {
    return <Navigate to="/dftasks/month-view" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 