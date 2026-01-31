import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import Toast from "react-native-toast-message";
import { authService } from "../../src/api/authService";
import { useAuthStore } from "../../src/store/useAuthStore"; // Імпортуємо стор

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const theme = useTheme();

  // Отримуємо функцію login зі стору
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Помилка",
        text2: "Будь ласка, заповніть усі поля 👋",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(email, password);

      // ПЕРЕВІРКА: чи повернув бекенд токен
      if (data.isAuthSuccessful && data.token) {
        // Оновлюємо глобальний стан (це також запише токен у SecureStore)
        await login(data.token);

        Toast.show({
          type: "success",
          text1: "Вітаємо!",
          text2: `Раді бачити вас знову! 🚀`,
        });

        // Більше не потрібен setTimeout і router.replace,
        // бо Zustand оновить стан і _layout сам зробить перехід.
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Невірний логін або пароль";
      Toast.show({
        type: "error",
        text1: "Помилка авторизації",
        text2: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text
          variant="displaySmall"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          FinGrid
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Увійдіть, щоб продовжити
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon="email-outline" />}
          style={styles.input}
        />

        <TextInput
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={secureText}
          left={<TextInput.Icon icon="lock-outline" />}
          right={
            <TextInput.Icon
              icon={secureText ? "eye" : "eye-off"}
              onPress={() => setSecureText(!secureText)}
            />
          }
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Увійти
        </Button>

        <Button
          mode="text"
          onPress={() => router.push("/screens/register")}
          style={styles.link}
          labelStyle={styles.linkLabel}
        >
          Немає акаунту? Реєстрація
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

// ... стилі без змін

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.6,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  link: {
    marginTop: 16,
  },
  linkLabel: {
    textDecorationLine: "underline",
  },
});
