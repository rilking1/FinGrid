import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  FAB,
  Modal,
  Portal,
  ProgressBar,
  SegmentedButtons,
  Text,
  TextInput,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import { bankService } from "../../src/api/bankService";
import { budgetService } from "../../src/api/budgetService";

interface TransactionHistoryItem {
  id: string;
  amount: number;
  description: string;
  time: number;
  source: "Bank" | "Manual";
  categoryName: string;
  categoryIcon: string;
}

interface BudgetCategory {
  id: number;
  name: string;
  monthlyLimit: number;
  spent: number;
  icon: string;
}

interface BudgetSummary {
  totalCapital: number;
  bankBalance: number;
  manualBalance: number;
  categories: BudgetCategory[];
}

export default function HomeScreen() {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const fetchData = async () => {
    try {
      const [sum, accs, history] = await Promise.all([
        budgetService.getSummary(),
        bankService.getAccounts(),
        budgetService.getHistory(),
      ]);
      setSummary(sum);
      setAccounts(accs);
      setTransactions(history);
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

  const handleSaveManual = async () => {
    if (!amount || !selectedCategoryId) {
      Toast.show({
        type: "error",
        text1: "Помилка",
        text2: "Виберіть суму та категорію",
      });
      return;
    }

    try {
      const result = await budgetService.addManualTransaction({
        walletId: 1,
        amount: parseFloat(amount),
        isIncome: type === "income",
        description:
          description || (type === "income" ? "Прибуток" : "Витрата"),
        categoryId: selectedCategoryId,
      });

      console.log("Результат збереження:", result);
      Toast.show({
        type: "success",
        text1: "Успішно",
        text2: "Операцію додано",
      });

      setVisible(false);
      setAmount("");
      setDescription("");
      setSelectedCategoryId(null);
      fetchData();
    } catch (e: any) {
      console.error("Помилка збереження:", e.response?.data || e.message);
      Toast.show({
        type: "error",
        text1: "Помилка збереження",
        text2: e.response?.data || "Перевірте з’єднання з сервером",
      });
    }
  };

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#2ECC71" />
    );

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={() => (
            <View>
              <View style={styles.summaryContainer}>
                <Text variant="labelMedium" style={{ color: "#7F8C8D" }}>
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

              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Мої рахунки
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.cardList}
              >
                {accounts.map((acc) => (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() =>
                      bankService.toggleInclusion(acc.id).then(fetchData)
                    }
                  >
                    <Card
                      style={[
                        styles.bankCard,
                        !acc.isIncludedInTotal && styles.excludedCard,
                      ]}
                    >
                      <Card.Content>
                        <View style={styles.cardHeader}>
                          <Text
                            variant="labelMedium"
                            style={{ color: "#fff", opacity: 0.8 }}
                          >
                            {acc.name}
                          </Text>
                          <Avatar.Icon
                            size={24}
                            icon={acc.isIncludedInTotal ? "eye" : "eye-off"}
                            color="#fff"
                            style={{ backgroundColor: "transparent" }}
                          />
                        </View>
                        <Text
                          variant="headlineSmall"
                          style={styles.balanceText}
                        >
                          {acc.balance.toLocaleString()} ₴
                        </Text>
                      </Card.Content>
                    </Card>
                  </TouchableOpacity>
                ))}
              </ScrollView>

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
                        <Text
                          variant="bodyMedium"
                          style={{ fontWeight: "600" }}
                        >
                          {cat.name}
                        </Text>
                        <Text variant="bodySmall" style={{ color: "#7F8C8D" }}>
                          {cat.spent?.toLocaleString()} /{" "}
                          {cat.monthlyLimit?.toLocaleString()} ₴
                        </Text>
                      </View>
                      <ProgressBar
                        progress={progress > 1 ? 1 : progress}
                        color={progress >= 1 ? "#E74C3C" : "#2ECC71"}
                        style={styles.progressBar}
                      />
                    </View>
                  );
                })}
              </View>

              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Історія операцій
              </ThemedText>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <Avatar.Icon
                size={40}
                icon={item.source === "Bank" ? "bank" : "wallet"}
                color={item.amount < 0 ? "#E74C3C" : "#2ECC71"}
                style={{ backgroundColor: "#f0f0f0" }}
              />
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
                  {item.description}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text variant="bodySmall" style={{ color: "#7F8C8D" }}>
                    {item.categoryName} •{" "}
                  </Text>
                  <Text variant="bodySmall">
                    {new Date(item.time * 1000).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text
                variant="bodyLarge"
                style={{
                  fontWeight: "bold",
                  color: item.amount < 0 ? "#2C3E50" : "#2ECC71",
                }}
              >
                {item.amount > 0 ? `+${item.amount}` : item.amount} ₴
              </Text>
            </View>
          )}
        />
      </ThemedView>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Нова операція
          </Text>

          <SegmentedButtons
            value={type}
            onValueChange={setType}
            style={styles.segmented}
            theme={{
              colors: {
                secondaryContainer: type === "expense" ? "#F8D7DA" : "#D4EDDA",
              },
            }}
            buttons={[
              { value: "expense", label: "Витрата", checkedColor: "#E74C3C" },
              { value: "income", label: "Прибуток", checkedColor: "#2ECC71" },
            ]}
          />

          <TextInput
            label="Сума (₴)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.modalInput}
          />

          <Text variant="labelLarge" style={{ marginBottom: 8 }}>
            Виберіть категорію:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 15 }}
          >
            {summary?.categories.map((cat) => (
              <Chip
                key={cat.id}
                selected={selectedCategoryId === cat.id}
                onPress={() => setSelectedCategoryId(cat.id)}
                style={{ marginRight: 8 }}
                selectedColor="#2ECC71"
              >
                {cat.name}
              </Chip>
            ))}
          </ScrollView>

          <TextInput
            label="Опис"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.modalInput}
          />

          <View style={styles.modalButtons}>
            <Button onPress={() => setVisible(false)}>Скасувати</Button>
            <Button
              mode="contained"
              onPress={handleSaveManual}
              buttonColor="#2ECC71"
            >
              Зберегти
            </Button>
          </View>
        </Modal>

        <FAB
          icon="plus"
          style={styles.fab}
          color="white"
          onPress={() => setVisible(true)}
        />
      </Portal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: "#f8f9fa" },
  summaryContainer: {
    margin: 20,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 28,
    alignItems: "center",
    elevation: 4,
  },
  totalAmount: {
    fontSize: 38,
    fontWeight: "900",
    marginVertical: 8,
    color: "#2C3E50",
  },
  balanceSplit: { flexDirection: "row", gap: 15, marginTop: 10 },
  splitText: { fontSize: 13, color: "#95A5A6", fontWeight: "500" },
  sectionTitle: {
    paddingHorizontal: 20,
    marginVertical: 15,
    fontSize: 18,
    fontWeight: "700",
  },
  cardList: { paddingLeft: 20, marginBottom: 10 },
  bankCard: {
    width: 260,
    marginRight: 15,
    backgroundColor: "#2C3E50",
    borderRadius: 24,
  },
  excludedCard: { opacity: 0.4, backgroundColor: "#95A5A6" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceText: {
    color: "#fff",
    fontWeight: "bold",
    marginVertical: 8,
    fontSize: 22,
  },
  categoriesContainer: { paddingHorizontal: 20, marginBottom: 10 },
  budgetRow: { marginBottom: 20 },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressBar: { height: 10, borderRadius: 5, backgroundColor: "#E9ECEF" },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 12,
    elevation: 1,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 90,
    backgroundColor: "#2ECC71",
    borderRadius: 30,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 24,
    margin: 20,
    borderRadius: 24,
  },
  modalTitle: { marginBottom: 20, textAlign: "center", fontWeight: "bold" },
  segmented: { marginBottom: 20 },
  modalInput: { marginBottom: 15 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
});
