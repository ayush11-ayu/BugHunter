import api from "./api";

// Create an activity for a bug
export const createActivity = async (
  bugId,
  action,
  description
) => {
  const response = await api.post(
    `/bugs/${bugId}/activities`,
    {
      action,
      description,
    }
  );

  return response.data;
};

// Get activities for a bug
export const getActivities = async (bugId) => {
  const response = await api.get(
    `/bugs/${bugId}/activities`
  );

  return response.data;
};
