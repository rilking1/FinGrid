import { Redirect } from "expo-router";
import { useAuthStore } from "../src/store/useAuthStore";

export default function Index() {
  const { isAuthenticated, isReady } = useAuthStore();

  // Поки стан не завантажився (isReady: false), нічого не рендеримо
  if (!isReady) return null;

  // Якщо авторизований — кидаємо в таби, якщо ні — на логін
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/screens/login" />;
  }
}
