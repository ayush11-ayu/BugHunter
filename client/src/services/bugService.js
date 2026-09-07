import api from "./api";

export const createBug = async (bugData) => {
  const response = await api.post("/bugs", bugData);
  return response.data;
};

export const getBugs = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.status) {
    params.append("status", filters.status);
  }

  if (filters.priority) {
    params.append("priority", filters.priority);
  }

  if (filters.severity) {
    params.append("severity", filters.severity);
  }

  const queryString = params.toString();

  const response = await api.get(
    queryString ? `/bugs?${queryString}` : "/bugs"
  );

  return response.data;
};

export const getBugById = async (id) => {
  const response = await api.get(`/bugs/${id}`);
  return response.data;
};

export const updateBug = async (id, bugData) => {
  const response = await api.put(`/bugs/${id}`, bugData);
  return response.data;
};

export const searchBugs = async (query) => {
  const response = await api.get(
    `/bugs/search?q=${encodeURIComponent(query)}`
  );

  return response.data;
};
