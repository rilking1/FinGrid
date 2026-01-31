import apiClient from "./config";

export const bankService = {
  syncMonobank: async (publicToken) => {
    const { data } = await apiClient.post(
      "/Bank/sync",
      JSON.stringify(publicToken),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return data;
  },
  // Нові методи:
  getAccounts: async () => {
    const { data } = await apiClient.get("/Bank/accounts");
    return data;
  },
  getTransactions: async () => {
    const { data } = await apiClient.get("/Bank/transactions-all");
    return data;
  },
};
