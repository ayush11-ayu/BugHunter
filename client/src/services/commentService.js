import api from "./api";

// Create a comment for a bug
export const createComment = async (bugId, text) => {
  const response = await api.post(
    `/bugs/${bugId}/comments`,
    { text }
  );

  return response.data;
};

// Get all comments for a bug
export const getComments = async (bugId) => {
  const response = await api.get(
    `/bugs/${bugId}/comments`
  );

  return response.data;
};

// Delete a comment
export const deleteComment = async (commentId) => {
  const response = await api.delete(
    `/comments/${commentId}`
  );

  return response.data;
};
