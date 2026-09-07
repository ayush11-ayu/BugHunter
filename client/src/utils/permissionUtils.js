import { getCurrentUserRole } from "./authUtils";

export const canManageUsers = () => {
  const role = getCurrentUserRole();

  return role === "admin" || role === "manager";
};

export const canAssignBugs = () => {
  const role = getCurrentUserRole();

  return role === "admin" || role === "manager";
};

export const canChangeBugStatus = () => {
  const role = getCurrentUserRole();

  return (
    role === "admin" ||
    role === "manager" ||
    role === "developer"
  );
};
