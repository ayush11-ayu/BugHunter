import api from "./api";

export const getDashboardSummary = async () => {
  const response = await api.get("/dashboard/summary");

  return response.data;
};

export const getBugStatusStats = async () => {
  const response = await api.get("/dashboard/bug-status");

  return response.data;
};

export const getBugPriorityStats = async () => {
  const response = await api.get("/dashboard/bug-priority");

  return response.data;
};

export const getProjectHealth = async () => {
  const response = await api.get("/dashboard/project-health");

  return response.data;
};
