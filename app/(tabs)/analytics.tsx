import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { ActivityIndicator, Card, List, Text } from "react-native-paper";
import { budgetService } from "../../src/api/budgetService";

const screenWidth = Dimensions.get("window").width;

// --- ТЕМИ ---
const LightTheme = {
  background: "#f8f9fa",
  card: "#ffffff",
  text: "#2C3E50",
  subText: "#7F8C8D",
  chartLegend: "#7F8C8D",
};

const DarkTheme = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#ECF0F1",
  subText: "#95A5A6",
  chartLegend: "#ECF0F1",
};

const CHART_COLORS = [
  "#2ECC71", // Зелений
  "#E74C3C", // Червоний
  "#F1C40F", // Жовтий
  "#3498DB", // Синій
  "#9B59B6", // Фіолетовий
  "#E67E22", // Помаранчевий
];

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const theme = isDark ? DarkTheme : LightTheme;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    try {
      const stats = await budgetService.getAnalytics();
      const formatted = stats.map((item: any, index: number) => ({
        name: item.name,
        population: item.spent,
        color: CHART_COLORS[index % CHART_COLORS.length],
        legendFontColor: theme.chartLegend, // Динамічний колір тексту в легенді
        legendFontSize: 12,
      }));
      setData(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [colorScheme]); // Перемальовуємо при зміні теми

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#2ECC71" />
    );

  const s = createStyles(theme);
  const totalSpent = data.reduce((a, b) => a + b.population, 0);

  return (
    <ThemedView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={s.header}>
          Аналітика витрат
        </ThemedText>

        <Card style={s.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={s.cardTitle}>
              Розподіл по категоріях
            </Text>
            {data.length > 0 ? (
              <PieChart
                data={data}
                width={screenWidth - 60}
                height={200}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            ) : (
              <Text style={s.emptyText}>Дані відсутні. Додайте витрати!</Text>
            )}
          </Card.Content>
        </Card>

        <ThemedText type="defaultSemiBold" style={s.sectionTitle}>
          Деталізація
        </ThemedText>

        <Card style={s.listCard}>
          {data.map((item, index) => (
            <List.Item
              key={index}
              title={item.name}
              titleStyle={{ color: theme.text, fontWeight: "600" }}
              description={`${item.population.toLocaleString()} ₴`}
              descriptionStyle={{ color: theme.subText }}
              left={(props) => (
                <View
                  {...props}
                  style={[s.colorDot, { backgroundColor: item.color }]}
                />
              )}
              right={(props) => (
                <Text {...props} style={s.percentText}>
                  {totalSpent > 0
                    ? ((item.population / totalSpent) * 100).toFixed(1)
                    : 0}
                  %
                </Text>
              )}
            />
          ))}
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

// --- СТИЛІ ---
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 60,
      paddingHorizontal: 20,
      backgroundColor: theme.background,
    },
    header: { marginBottom: 20, color: theme.text },
    chartCard: {
      borderRadius: 24,
      backgroundColor: theme.card,
      elevation: 4,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    cardTitle: {
      marginBottom: 10,
      fontWeight: "bold",
      textAlign: "center",
      color: theme.text,
    },
    sectionTitle: { marginVertical: 15, fontSize: 18, color: theme.text },
    listCard: {
      borderRadius: 20,
      backgroundColor: theme.card,
      elevation: 2,
      paddingVertical: 10,
      marginBottom: 30,
    },
    colorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      alignSelf: "center",
      marginLeft: 15,
    },
    percentText: {
      alignSelf: "center",
      marginRight: 15,
      fontWeight: "bold",
      color: theme.text,
    },
    emptyText: {
      textAlign: "center",
      marginVertical: 30,
      color: theme.subText,
    },
  });
