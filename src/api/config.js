import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Виносимо IP в одну константу
export const BASE_URL = "http://192.168.31.150:5053/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.log("SecureStore error", e);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default apiClient;
