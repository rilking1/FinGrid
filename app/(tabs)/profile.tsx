import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View, useColorScheme } from "react-native"; // Додали useColorScheme
import {
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Switch,
  Text, // ДОДАЛИ ЦЕЙ ІМПОРТ
} from "react-native-paper";
import Toast from "react-native-toast-message";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";

import { useAuthStore } from "../../src/store/useAuthStore";

// --- ТЕМИ (LightTheme/DarkTheme залишаємо) ---
const LightTheme = {
  background: "#f8f9fa",
  card: "#ffffff",
  text: "#2C3E50",
  subText: "#7F8C8D",
  border: "#E9ECEF",
  danger: "#E74C3C",
  accent: "#2ECC71",
};

const DarkTheme = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#ECF0F1",
  subText: "#95A5A6",
  border: "#333333",
  danger: "#FF6B6B",
  accent: "#2ECC71",
};

export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const theme = isDark ? DarkTheme : LightTheme;

  const [isSyncEnabled, setIsSyncEnabled] = useState(true);

  // ... (handleLogout та handleDisconnectBank залишаються без змін)

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
    Alert.alert("Відключити банк?", "Всі завантажені дані залишаться...", [
      { text: "Скасувати" },
      {
        text: "Відключити",
        style: "destructive",
        onPress: () => setIsSyncEnabled(false),
      },
    ]);
  };

  const s = createStyles(theme, isDark);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#2C3E50" }}
      headerImage={
        <IconSymbol
          size={310}
          color={isDark ? "#34495E" : "#808080"}
          name="person.crop.circle.fill"
          style={s.headerImage}
        />
      }
    >
      <ThemedView style={s.profileHeader}>
        <Avatar.Text size={64} label="РК" style={s.avatar} />
        <View style={{ marginLeft: 16 }}>
          <ThemedText type="title" style={s.userName}>
            Роман Козакевич
          </ThemedText>
          <Text style={s.userEmail}>User5@example.com</Text>
        </View>
      </ThemedView>

      <ThemedView style={s.contentContainer}>
        <ThemedText type="defaultSemiBold" style={s.sectionLabel}>
          Банківська інтеграція
        </ThemedText>
        <Card style={s.card}>
          <List.Item
            title="Monobank"
            titleStyle={s.listTitle}
            description={
              isSyncEnabled ? "Синхронізація активна" : "Синхронізація вимкнена"
            }
            descriptionStyle={s.listSub}
            left={(props) => (
              <List.Icon
                {...props}
                icon="bank"
                color={isSyncEnabled ? theme.accent : theme.subText}
              />
            )}
            right={() => (
              <Switch
                value={isSyncEnabled}
                onValueChange={setIsSyncEnabled}
                color={theme.accent}
              />
            )}
          />
          <Divider style={s.divider} />
          <Card.Actions>
            {isSyncEnabled ? (
              <Button onPress={handleDisconnectBank} textColor={theme.danger}>
                Відключити
              </Button>
            ) : (
              <Button
                onPress={() => router.push("/screens/connect-bank")}
                textColor={theme.accent}
              >
                Підключити
              </Button>
            )}
            <Button icon="refresh" onPress={() => {}} textColor={theme.text}>
              Оновити дані
            </Button>
          </Card.Actions>
        </Card>

        {/* Налаштування, Допомога та LogoutButton... */}
        <Button
          mode="contained"
          icon="logout"
          onPress={handleLogout}
          style={s.logoutButton}
          buttonColor={isDark ? "#2A1A1A" : "#FEF2F2"}
          textColor={theme.danger}
        >
          Вийти з акаунту
        </Button>

        <ThemedText style={s.versionText}>
          FinGrid v1.0.2 (Build 2026)
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

// --- Стилі створюємо через функцію (createStyles) ---
const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    headerImage: { bottom: -90, left: -35, position: "absolute" },
    profileHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    avatar: { backgroundColor: isDark ? "#2ECC71" : "#2C3E50" },
    userName: { fontFamily: Fonts.rounded, color: theme.text, fontSize: 22 },
    userEmail: { color: theme.subText, fontSize: 14 },
    contentContainer: { paddingHorizontal: 16 },
    sectionLabel: {
      marginTop: 24,
      marginBottom: 8,
      color: theme.subText,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 20,
      elevation: isDark ? 0 : 2,
      borderWidth: isDark ? 1 : 0,
      borderColor: theme.border,
    },
    listTitle: { color: theme.text, fontWeight: "600" },
    listSub: { color: theme.subText },
    divider: { backgroundColor: theme.border },
    logoutButton: {
      marginTop: 30,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? "#442222" : "#FEE2E2",
    },
    versionText: {
      textAlign: "center",
      color: theme.subText,
      fontSize: 11,
      marginTop: 30,
      marginBottom: 40,
    },
  });
