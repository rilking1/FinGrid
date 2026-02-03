import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import {
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Switch,
} from "react-native-paper";
import Toast from "react-native-toast-message";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";

import { useAuthStore } from "../../src/store/useAuthStore";

export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const [isSyncEnabled, setIsSyncEnabled] = useState(true);

  const handleLogout = async () => {
    Alert.alert("Вихід", "Ви впевнені, що хочете вийти?", [
      { text: "Скасувати", style: "cancel" },
      {
        text: "Вийти",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            Toast.show({
              type: "info",
              text1: "Вихід",
              text2: "Чекаємо на вас знову! 👋",
            });
          } catch (error) {
            Toast.show({
              type: "error",
              text1: "Помилка",
              text2: "Не вдалося вийти",
            });
          }
        },
      },
    ]);
  };

  const handleDisconnectBank = () => {
    Alert.alert(
      "Відключити банк?",
      "Всі завантажені дані залишаться, але нові транзакції не будуть приходити.",
      [
        { text: "Скасувати" },
        {
          text: "Відключити",
          style: "destructive",
          onPress: () => setIsSyncEnabled(false),
        },
      ],
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="person.crop.circle.fill"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.profileHeader}>
        <Avatar.Text
          size={64}
          label="РК"
          style={{ backgroundColor: "#2C3E50" }}
        />
        <View style={{ marginLeft: 16 }}>
          <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
            Роман Козакевич
          </ThemedText>
          <ThemedText style={{ color: "#666" }}>User5@example.com</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.contentContainer}>
        <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>
          Банківська інтеграція
        </ThemedText>
        <Card style={styles.card}>
          <List.Item
            title="Monobank"
            description={
              isSyncEnabled ? "Синхронізація активна" : "Синхронізація вимкнена"
            }
            left={(props) => (
              <List.Icon
                {...props}
                icon="bank"
                color={isSyncEnabled ? "#2ECC71" : "#95A5A6"}
              />
            )}
            right={() => (
              <Switch
                value={isSyncEnabled}
                onValueChange={setIsSyncEnabled}
                color="#2ECC71"
              />
            )}
          />
          <Divider />
          <Card.Actions>
            {isSyncEnabled ? (
              <Button onPress={handleDisconnectBank} textColor="#E74C3C">
                Відключити рахунки
              </Button>
            ) : (
              <Button onPress={() => router.push("/screens/connect-bank")}>
                Підключити банк
              </Button>
            )}
            <Button
              icon="refresh"
              onPress={() =>
                Toast.show({ type: "success", text1: "Оновлення..." })
              }
            >
              Оновити дані
            </Button>
          </Card.Actions>
        </Card>

        <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>
          Загальні налаштування
        </ThemedText>
        <Card style={styles.card}>
          <List.Item
            title="Валюта за замовчуванням"
            description="Українська гривня (₴)"
            left={(props) => <List.Icon {...props} icon="currency-uah" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Мова"
            description="Українська"
            left={(props) => <List.Icon {...props} icon="translate" />}
            onPress={() => {}}
          />
        </Card>

        <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>
          Допомога
        </ThemedText>
        <Collapsible title="Як працює автоматичний бюджет?">
          <ThemedText>
            FinGrid аналізує ваші банківські транзакції за кодами MCC і
            автоматично розподіляє їх по створених вами категоріях.
          </ThemedText>
        </Collapsible>

        <Divider style={styles.divider} />

        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#E74C3C"
          labelStyle={styles.logoutLabel}
        >
          Вийти з акаунту
        </Button>

        <ThemedText style={styles.versionText}>
          FinGrid v1.0.2 (Build 2026)
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
    color: "#2C3E50",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    overflow: "hidden",
  },
  divider: {
    marginVertical: 10,
    backgroundColor: "transparent",
  },
  logoutButton: {
    marginTop: 20,
    borderColor: "#E74C3C",
    borderRadius: 12,
    borderWidth: 1.5,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  versionText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  },
});
