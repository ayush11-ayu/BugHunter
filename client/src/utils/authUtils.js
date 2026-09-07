export const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Failed to read current user:", error);
    return null;
  }
};

export const getCurrentUserRole = () => {
  const user = getCurrentUser();

  return user?.role || null;
};

export const isAdmin = () => {
  return getCurrentUserRole() === "admin";
};

export const isManager = () => {
  return getCurrentUserRole() === "manager";
};

export const isDeveloper = () => {
  return getCurrentUserRole() === "developer";
};

export const isTester = () => {
  return getCurrentUserRole() === "tester";
};
