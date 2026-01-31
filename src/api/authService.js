import * as SecureStore from "expo-secure-store";
import apiClient from "./config";

const saveToken = async (token) => {
  if (token) await SecureStore.setItemAsync("userToken", token);
};

export const authService = {
  register: async (email, password, passwordConfirm) => {
    const { data } = await apiClient.post("/Account/register", {
      email,
      password,
      passwordConfirm,
    });
    await saveToken(data.token);
    return data;
  },

  login: async (email, password) => {
    const { data } = await apiClient.post("/Account/login", {
      email,
      password,
      rememberMe: true,
    });
    await saveToken(data.token);
    return data;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("userToken");
  },
};
