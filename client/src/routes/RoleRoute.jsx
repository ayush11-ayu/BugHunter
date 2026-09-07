import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUserRole } from "../utils/authUtils";

function RoleRoute({ allowedRoles }) {
  const currentRole = getCurrentUserRole();

  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
