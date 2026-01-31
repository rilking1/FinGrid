import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

// Імпортуємо ваш стор та конфіг тостів
import { toastConfig } from "../src/components/ToastConfig";
import { useAuthStore } from "../src/store/useAuthStore";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments() as string[];

  // Отримуємо стан та функції зі стору Zustand
  const { isAuthenticated, isReady, checkAuth } = useAuthStore();

  // 1. Ініціалізація: перевіряємо токен при запуску
  useEffect(() => {
    checkAuth();
  }, []);

  // 2. Глобальна логіка перенаправлення (Auth Guard)
  useEffect(() => {
    if (!isReady) return;

    // Визначаємо, де саме ми зараз знаходимось
    const currentPath = segments.join("/");
    const isAuthPath =
      currentPath === "screens/login" || currentPath === "screens/register";
    const inTabsGroup = segments[0] === "(tabs)";
    const inScreensGroup = segments[0] === "screens";
    const atRoot = segments.length === 0;

    if (!isAuthenticated) {
      // ЯКЩО НЕ АВТОРИЗОВАНИЙ:
      // Дозволяємо бути ТІЛЬКИ на логіні/реєстрації. З усіх інших місць — на логін.
      if (!isAuthPath) {
        router.replace("/screens/login");
      }
    } else {
      // ЯКЩО АВТОРИЗОВАНИЙ:
      // Не даємо заходити на сторінки логіну/реєстрації або корінь.
      if (isAuthPath || atRoot) {
        router.replace("/(tabs)");
      }
      // Якщо користувач іде в screens/connect-bank — МИ НЕ ПЕРЕШКОДЖАЄМО (немає редиректу)
    }
  }, [isAuthenticated, isReady, segments]);

  // Поки ми не знаємо статус авторизації, показуємо порожній екран
  if (!isReady) {
    return null;
  }

  return (
    <PaperProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Головна група табів */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Екрани авторизації (без хедерів) */}
          <Stack.Screen
            name="screens/login"
            options={{
              animation: "slide_from_left",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screens/register"
            options={{
              animation: "slide_from_right",
              headerShown: false,
            }}
          />

          {/* Екран підключення банку (з хедером і кнопкою "Назад") */}
          <Stack.Screen
            name="screens/connect-bank"
            options={{
              headerShown: true,
              title: "Підключення Monobank",
              headerBackTitle: "Назад",
              presentation: "card", // відкривається як звичайна сторінка
            }}
          />

          {/* Модальні вікна */}
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Інформація" }}
          />
        </Stack>

        <StatusBar style="auto" />
      </ThemeProvider>

      <Toast config={toastConfig} />
    </PaperProvider>
  );
}
