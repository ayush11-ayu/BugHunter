import api from "./api";

export const analyzeBug = async (bugId) => {
  const response = await api.post(`/ai/analyze/${bugId}`);

  return response.data;
};

export const getAIAnalysis = async (bugId) => {
  const response = await api.get(`/ai/analysis/${bugId}`);

  return response.data;
};

// Check whether this bug has possible duplicates
export const checkDuplicateBug = async (bugId) => {
  const response = await api.get(
    `/ai/duplicate-check/${bugId}`
  );

  return response.data;
};