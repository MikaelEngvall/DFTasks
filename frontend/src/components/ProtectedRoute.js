import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Om en specifik roll krävs, kontrollera den
    if (requiredRole && decoded.role !== requiredRole) {
      // Om användaren inte har rätt roll, skicka dem till deras dashboard
      return (
        <Navigate
          to={decoded.role === "ADMIN" ? "/admin" : "/dashboard"}
          replace
        />
      );
    }

    return children;
  } catch (error) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;
