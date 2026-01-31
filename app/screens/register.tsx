import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import Toast from "react-native-toast-message"; // Додано Toast
import { authService } from "../../src/api/authService";
import { useAuthStore } from "../../src/store/useAuthStore"; // Додано стор

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const theme = useTheme();
  const login = useAuthStore((state) => state.login);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Помилка",
        text2: "Заповніть усі поля",
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Помилка",
        text2: "Паролі не збігаються",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await authService.register(email, password, confirmPassword);

      if (data.token) {
        Toast.show({
          type: "success",
          text1: "Успіх",
          text2: "Реєстрація пройшла вдало! 🎉",
        });

        // Одразу логінимо користувача
        await login(data.token);
      } else {
        // Якщо токена немає, просто відправляємо на вхід
        Toast.show({
          type: "success",
          text1: "Успіх",
          text2: "Акаунт створено. Тепер увійдіть.",
        });
        router.replace("/screens/login");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Помилка реєстрації";
      Toast.show({ type: "error", text1: "Помилка", text2: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.main}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          variant="headlineLarge"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Створити акаунт
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
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

        <TextInput
          label="Підтвердіть пароль"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          secureTextEntry={secureText}
          left={<TextInput.Icon icon="lock-check-outline" />}
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
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Зареєструватися
        </Button>

        <Button
          mode="text"
          onPress={() => router.push("/screens/login")}
          style={styles.link}
          labelStyle={styles.linkLabel}
        >
          Вже є акаунт? Увійти
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ... стилі без змін

const styles = StyleSheet.create({
  main: {
    flex: 1,
    // backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    opacity: 0.6,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 15,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  link: {
    marginTop: 15,
  },
  linkLabel: {
    textDecorationLine: "underline",
  },
});
