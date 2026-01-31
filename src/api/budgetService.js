import apiClient from "./config";

export const budgetService = {
  getSummary: async () => {
    const { data } = await apiClient.get("/Budget/summary");
    return data;
  },
  addCategory: async (category) => {
    const { data } = await apiClient.post("/Budget/categories", category);
    return data;
  },
};
