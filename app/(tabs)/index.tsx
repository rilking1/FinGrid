import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Card,
  ProgressBar,
  Text,
} from "react-native-paper";
import { bankService } from "../../src/api/bankService";
import { budgetService } from "../../src/api/budgetService"; // Не забудь створити цей сервіс

// --- Інтерфейси ---
interface BankAccount {
  id: number;
  name: string;
  balance: number;
  iban: string;
}

interface BudgetCategory {
  id: number;
  name: string;
  monthlyLimit: number;
  spent: number; // Ми додамо це поле на бекенді пізніше
}

interface BankTransaction {
  id: number;
  description: string;
  amount: number;
  time: number;
}

interface BudgetSummary {
  totalCapital: number;
  bankBalance: number;
  manualBalance: number;
  categories: BudgetCategory[];
}

export default function HomeScreen() {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Отримуємо всі дані паралельно
      const [sum, accs, txs] = await Promise.all([
        budgetService.getSummary(),
        bankService.getAccounts(),
        bankService.getTransactions(),
      ]);
      setSummary(sum);
      setAccounts(accs);
      setTransactions(txs);
    } catch (error) {
      console.error("Помилка завантаження даних:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#2ECC71" />
    );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={() => (
          <View>
            {/* ВІДЖЕТ ЗАГАЛЬНОГО КАПІТАЛУ */}
            <View style={styles.summaryContainer}>
              <Text variant="labelMedium" style={{ color: "#666" }}>
                Загальний капітал
              </Text>
              <ThemedText type="title" style={styles.totalAmount}>
                {(summary?.totalCapital || 0).toLocaleString()} ₴
              </ThemedText>
              <View style={styles.balanceSplit}>
                <Text style={styles.splitText}>
                  🏦 Банк: {summary?.bankBalance?.toLocaleString()} ₴
                </Text>
                <Text style={styles.splitText}>
                  💵 Готівка: {summary?.manualBalance?.toLocaleString()} ₴
                </Text>
              </View>
            </View>

            {/* СПИСОК КАРТОК МОНО */}
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Мої рахунки
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.cardList}
            >
              {accounts.map((acc) => (
                <Card key={acc.id} style={styles.bankCard}>
                  <Card.Content>
                    <Text
                      variant="labelMedium"
                      style={{ color: "#fff", opacity: 0.8 }}
                    >
                      {acc.name}
                    </Text>
                    <Text variant="headlineSmall" style={styles.balanceText}>
                      {acc.balance.toLocaleString()} ₴
                    </Text>
                    <Text variant="bodySmall" style={{ color: "#ccc" }}>
                      {acc.iban.slice(0, 15)}...
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>

            {/* БЮДЖЕТ ПО КАТЕГОРІЯХ */}
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Бюджет на місяць
            </ThemedText>
            <View style={styles.categoriesContainer}>
              {summary?.categories.map((cat) => {
                const progress =
                  cat.monthlyLimit > 0
                    ? (cat.spent || 0) / cat.monthlyLimit
                    : 0;
                return (
                  <View key={cat.id} style={styles.budgetRow}>
                    <View style={styles.budgetHeader}>
                      <Text variant="bodyMedium">{cat.name}</Text>
                      <Text variant="bodySmall">
                        {cat.spent || 0} / {cat.monthlyLimit} ₴
                      </Text>
                    </View>
                    <ProgressBar
                      progress={progress > 1 ? 1 : progress}
                      color={progress > 0.9 ? "#E74C3C" : "#2ECC71"}
                      style={styles.progressBar}
                    />
                  </View>
                );
              })}
            </View>

            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Останні транзакції
            </ThemedText>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Avatar.Icon
              size={40}
              icon={item.amount < 0 ? "cart" : "cash-plus"}
              color={item.amount < 0 ? "#E74C3C" : "#2ECC71"}
              style={{
                backgroundColor: item.amount < 0 ? "#F8D7DA" : "#D4EDDA",
              }}
            />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
                {item.description}
              </Text>
              <Text variant="bodySmall">
                {new Date(item.time * 1000).toLocaleDateString()}
              </Text>
            </View>
            <Text
              variant="bodyLarge"
              style={{
                fontWeight: "bold",
                color: item.amount < 0 ? "#000" : "#2ECC71",
              }}
            >
              {item.amount > 0 ? `+${item.amount}` : item.amount} ₴
            </Text>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: "#fdfdfd" },
  header: { paddingHorizontal: 20, marginBottom: 10 },
  summaryContainer: {
    margin: 20,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 24,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "800",
    marginVertical: 8,
    color: "#2C3E50",
  },
  balanceSplit: { flexDirection: "row", gap: 15, marginTop: 10 },
  splitText: { fontSize: 12, color: "#7F8C8D" },
  sectionTitle: { paddingHorizontal: 20, marginVertical: 15, fontSize: 18 },
  cardList: { paddingLeft: 20, marginBottom: 10 },
  bankCard: {
    width: 260,
    marginRight: 15,
    backgroundColor: "#2C3E50",
    borderRadius: 20,
  },
  balanceText: { color: "#fff", fontWeight: "bold", marginVertical: 8 },
  categoriesContainer: { paddingHorizontal: 20, marginBottom: 10 },
  budgetRow: { marginBottom: 18 },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressBar: { height: 8, borderRadius: 4, backgroundColor: "#EDF2F7" },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    elevation: 1,
  },
});
