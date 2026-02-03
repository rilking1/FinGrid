import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { ActivityIndicator, Card, List, Text } from "react-native-paper";
import { budgetService } from "../../src/api/budgetService";

const screenWidth = Dimensions.get("window").width;

const CHART_COLORS = [
  "#2ECC71",
  "#E74C3C",
  "#F1C40F",
  "#3498DB",
  "#9B59B6",
  "#E67E22",
];

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    try {
      const stats = await budgetService.getAnalytics();
      const formatted = stats.map((item: any, index: number) => ({
        name: item.name,
        population: item.spent,
        color: CHART_COLORS[index % CHART_COLORS.length],
        legendFontColor: "#7F8C8D",
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
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.header}>
          Аналітика витрат
        </ThemedText>

        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Розподіл по категоріях
            </Text>
            {data.length > 0 ? (
              <PieChart
                data={data}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            ) : (
              <Text style={styles.emptyText}>
                Дані відсутні. Додайте витрати!
              </Text>
            )}
          </Card.Content>
        </Card>

        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Деталізація
        </ThemedText>
        <Card style={styles.listCard}>
          {data.map((item, index) => (
            <List.Item
              key={index}
              title={item.name}
              description={`${item.population.toLocaleString()} ₴`}
              left={(props) => (
                <View
                  {...props}
                  style={[styles.colorDot, { backgroundColor: item.color }]}
                />
              )}
              right={(props) => (
                <Text {...props} style={styles.percentText}>
                  {(
                    (item.population /
                      data.reduce((a, b) => a + b.population, 0)) *
                    100
                  ).toFixed(1)}
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

const chartConfig = {
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
  },
  header: { marginBottom: 20 },
  chartCard: {
    borderRadius: 24,
    backgroundColor: "#fff",
    elevation: 2,
    marginBottom: 20,
  },
  cardTitle: { marginBottom: 10, fontWeight: "bold", textAlign: "center" },
  sectionTitle: { marginVertical: 15, fontSize: 18 },
  listCard: {
    borderRadius: 20,
    backgroundColor: "#fff",
    elevation: 1,
    paddingVertical: 10,
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
    color: "#2C3E50",
  },
  emptyText: { textAlign: "center", marginVertical: 30, color: "#95A5A6" },
});
