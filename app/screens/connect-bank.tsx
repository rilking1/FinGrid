import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { bankService } from "../../src/api/bankService";

export default function ConnectBankScreen() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    if (!token) {
      Alert.alert("Помилка", "Будь ласка, вставте токен");
      return;
    }

    setLoading(true);
    try {
      const result = await bankService.syncMonobank(token);
      Alert.alert(
        "Успіх!",
        `Привіт, ${result.userName}. Синхронізовано ${result.accountsCount} рахунків.`,
      );
      router.replace("/(tabs)"); // Повертаємось на головну
    } catch (error) {
      Alert.alert("Помилка", "Не вдалося підключити банк. Перевірте токен.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Підключення Monobank</Text>
      <Text style={styles.subtitle}>
        Отримайте токен на api.monobank.ua та вставте його нижче:
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Вставте X-Token"
        value={token}
        onChangeText={setToken}
        secureTextEntry // Токен - це секрет, краще його приховати
      />

      {loading ? (
        <ActivityIndicator size="large" color="#2ECC71" />
      ) : (
        <Button title="Синхронізувати" onPress={handleSync} color="#2ECC71" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
});
