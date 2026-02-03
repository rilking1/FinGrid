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
  addManualTransaction: async (transactionData) => {
    const { data } = await apiClient.post(
      "/Budget/manual-transaction",
      transactionData,
    );
    return data;
  },
  getAnalytics: async () => {
    const { data } = await apiClient.get("/Budget/analytics");
    return data;
  },
  getHistory: async () => {
    const { data } = await apiClient.get("/Budget/history");
    return data;
  },
};
