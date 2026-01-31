import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isReady: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isReady: false,

  // Ініціалізація при старті
  checkAuth: async () => {
    const token = await SecureStore.getItemAsync("userToken");
    set({ isAuthenticated: !!token, isReady: true });
  },

  login: async (token: string) => {
    await SecureStore.setItemAsync("userToken", token);
    set({ isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("userToken");
    set({ isAuthenticated: false });
  },
}));
