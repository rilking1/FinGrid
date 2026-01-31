import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { Button, Card, Divider } from "react-native-paper";
import Toast from "react-native-toast-message";

// Компоненти шаблону
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";

// Стор для керування авторизацією
import { useAuthStore } from "../../src/store/useAuthStore";

export default function TabTwoScreen() {
  const router = useRouter();

  // Отримуємо функцію виходу зі стору Zustand
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
      Toast.show({
        type: "info",
        text1: "Вихід",
        text2: "Ви успішно вийшли з системи 🔓",
      });
      // Глобальний _layout автоматично перенаправить на логін
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Помилка",
        text2: "Не вдалося вийти з акаунту",
      });
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="gearshape.fill"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Налаштування
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.contentContainer}>
        {/* Секція Банківської Інтеграції */}
        <Card style={styles.card}>
          <Card.Title
            title="Банківські рахунки"
            subtitle="Синхронізація з вашими банками"
            left={(props) => (
              <IconSymbol
                {...props}
                name="creditcard.fill"
                size={24}
                color="#2ECC71"
              />
            )}
          />
          <Card.Content>
            <ThemedText style={styles.cardDescription}>
              Підключіть Monobank, щоб автоматично отримувати транзакції та
              бачити актуальний баланс.
            </ThemedText>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => router.push("/screens/connect-bank")}
              buttonColor="#2ECC71"
              icon="bank-plus"
              style={styles.actionButton}
            >
              Підключити Mono
            </Button>
          </Card.Actions>
        </Card>

        <Divider style={styles.divider} />

        {/* Секція інфо-блоків */}
        <Collapsible title="Про проект FinGrid">
          <ThemedText>
            FinGrid — це ваш персональний фінансовий хаб. Тут ви можете
            об'єднати всі рахунки в одну зручну сітку (Grid).
          </ThemedText>
        </Collapsible>

        <Collapsible title="Безпека даних">
          <ThemedText>
            Ми використовуємо{" "}
            <ThemedText type="defaultSemiBold">Expo SecureStore</ThemedText> для
            збереження ваших токенів. Ваші банківські дані шифруються на рівні
            пристрою.
          </ThemedText>
        </Collapsible>

        <Divider style={styles.divider} />

        {/* Кнопка Логаута */}
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
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  actionButton: {
    borderRadius: 8,
    width: "100%",
  },
  divider: {
    marginVertical: 10,
    backgroundColor: "#eee",
  },
  logoutButton: {
    marginTop: 20,
    borderColor: "#E74C3C",
    borderRadius: 8,
    borderWidth: 1.5,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
