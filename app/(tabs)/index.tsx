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
  useColorScheme,
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

// --- Інтерфейси ---
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

interface ManualWallet {
  id: number;
  name: string;
  balance: number;
}

interface BudgetSummary {
  totalCapital: number;
  bankBalance: number;
  manualBalance: number;
  categories: BudgetCategory[];
  manualWallets: ManualWallet[];
}

export default function HomeScreen() {
  // --- Тема та Кольори ---
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const theme = isDark ? DarkTheme : LightTheme;

  // --- Стейт ---
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Стейт для модалки транзакції
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  // Стейт для модалки категорії
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatLimit, setNewCatLimit] = useState("");

  // --- Логіка завантаження ---
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

  // --- Обробники подій ---
  const handleCreateCategory = async () => {
    if (!newCatName || !newCatLimit) return;

    try {
      await budgetService.addCategory({
        name: newCatName,
        monthlyLimit: parseFloat(newCatLimit),
        icon: "tag.fill",
      });

      Toast.show({
        type: "success",
        text1: "Готово!",
        text2: "Категорію створено",
      });
      setCategoryModalVisible(false);
      setNewCatName("");
      setNewCatLimit("");
      fetchData();
    } catch (e) {
      console.error("Помилка створення категорії:", e);
    }
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

    const walletId = summary?.manualWallets[0]?.id;
    if (!walletId) {
      Toast.show({
        type: "error",
        text1: "Помилка",
        text2: "Гаманець не знайдено",
      });
      return;
    }

    try {
      await budgetService.addManualTransaction({
        walletId: walletId,
        amount: parseFloat(amount),
        isIncome: type === "income",
        description:
          description || (type === "income" ? "Прибуток" : "Витрата"),
        categoryId: selectedCategoryId,
      });

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
      Toast.show({
        type: "error",
        text1: "Помилка сервера",
        text2: e.response?.data || "Не вдалося зберегти операцію",
      });
    }
  };

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#2ECC71" />
    );

  // Генеруємо стилі залежно від теми
  const s = createStyles(theme, isDark);

  return (
    <ThemedView style={s.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={() => (
          <View>
            {/* ЗАГАЛЬНИЙ КАПІТАЛ */}
            <View style={s.summaryContainer}>
              <Text style={s.summaryLabel}>Загальний капітал</Text>
              <ThemedText type="title" style={s.totalAmount}>
                {(summary?.totalCapital || 0).toLocaleString()} ₴
              </ThemedText>
              <View style={s.balanceSplit}>
                <Text style={s.splitText}>
                  🏦 Банк: {summary?.bankBalance?.toLocaleString()} ₴
                </Text>
                <Text style={s.splitText}>
                  💵 Готівка: {summary?.manualBalance?.toLocaleString()} ₴
                </Text>
              </View>
            </View>

            {/* РАХУНКИ */}
            <ThemedText type="defaultSemiBold" style={s.sectionTitle}>
              Мої рахунки
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.cardList}
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
                      s.bankCard,
                      !acc.isIncludedInTotal && s.excludedCard,
                    ]}
                  >
                    <Card.Content>
                      <View style={s.cardHeader}>
                        <Text style={s.cardSubTitle}>{acc.name}</Text>
                        <Avatar.Icon
                          size={24}
                          icon={acc.isIncludedInTotal ? "eye" : "eye-off"}
                          color="#fff"
                          style={{ backgroundColor: "transparent" }}
                        />
                      </View>
                      <Text style={s.balanceText}>
                        {acc.balance.toLocaleString()} ₴
                      </Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* БЮДЖЕТ */}
            <View style={s.budgetSectionHeader}>
              <ThemedText type="defaultSemiBold" style={s.sectionTitle}>
                Бюджет на місяць
              </ThemedText>
              <TouchableOpacity onPress={() => setCategoryModalVisible(true)}>
                <Text style={s.addBtn}>+ Додати</Text>
              </TouchableOpacity>
            </View>

            <View style={s.categoriesContainer}>
              {summary?.categories.map((cat) => {
                const progress =
                  cat.monthlyLimit > 0
                    ? (cat.spent || 0) / cat.monthlyLimit
                    : 0;
                return (
                  <View key={cat.id} style={s.budgetRow}>
                    <View style={s.budgetHeader}>
                      <Text style={s.catName}>{cat.name}</Text>
                      <Text style={s.catStats}>
                        {cat.spent?.toLocaleString()} /{" "}
                        {cat.monthlyLimit?.toLocaleString()} ₴
                      </Text>
                    </View>
                    <ProgressBar
                      progress={progress > 1 ? 1 : progress}
                      color={progress >= 1 ? "#E74C3C" : "#2ECC71"}
                      style={s.progressBar}
                    />
                  </View>
                );
              })}
            </View>

            <ThemedText type="defaultSemiBold" style={s.sectionTitle}>
              Історія операцій
            </ThemedText>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={s.transactionItem}>
            <Avatar.Icon
              size={40}
              icon={item.source === "Bank" ? "bank" : "wallet"}
              color={item.amount < 0 ? "#E74C3C" : "#2ECC71"}
              style={s.transIcon}
            />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={s.transDesc}>{item.description}</Text>
              <Text style={s.transSub}>
                {item.categoryName} •{" "}
                {new Date(item.time * 1000).toLocaleDateString()}
              </Text>
            </View>
            <Text
              style={[
                s.transAmount,
                { color: item.amount < 0 ? theme.text : "#2ECC71" },
              ]}
            >
              {item.amount > 0 ? `+${item.amount}` : item.amount} ₴
            </Text>
          </View>
        )}
      />

      <Portal>
        {/* МОДАЛКА ОПЕРАЦІЇ */}
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={s.modalContent}
        >
          <Text style={s.modalTitle}>Нова операція</Text>
          <SegmentedButtons
            value={type}
            onValueChange={setType}
            style={s.segmented}
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
            style={s.modalInput}
          />
          <Text style={s.inputLabel}>Виберіть категорію:</Text>
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
            style={s.modalInput}
          />
          <View style={s.modalButtons}>
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

        {/* МОДАЛКА КАТЕГОРІЇ */}
        <Modal
          visible={categoryModalVisible}
          onDismiss={() => setCategoryModalVisible(false)}
          contentContainerStyle={s.modalContent}
        >
          <Text style={s.modalTitle}>Нова категорія</Text>
          <TextInput
            label="Назва"
            value={newCatName}
            onChangeText={setNewCatName}
            mode="outlined"
            style={s.modalInput}
          />
          <TextInput
            label="Ліміт (₴)"
            value={newCatLimit}
            onChangeText={setNewCatLimit}
            keyboardType="numeric"
            mode="outlined"
            style={s.modalInput}
          />
          <View style={s.modalButtons}>
            <Button onPress={() => setCategoryModalVisible(false)}>
              Скасувати
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateCategory}
              buttonColor="#2ECC71"
            >
              Створити
            </Button>
          </View>
        </Modal>

        <FAB
          icon="plus"
          style={s.fab}
          color="white"
          onPress={() => setVisible(true)}
        />
      </Portal>
    </ThemedView>
  );
}

// --- ТЕМИ ТА СТИЛІ ---
const LightTheme = {
  background: "#f8f9fa",
  card: "#fff",
  text: "#2C3E50",
  subText: "#7F8C8D",
};
const DarkTheme = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#ECF0F1",
  subText: "#95A5A6",
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, paddingTop: 60, backgroundColor: theme.background },
    summaryContainer: {
      margin: 20,
      padding: 24,
      backgroundColor: theme.card,
      borderRadius: 28,
      alignItems: "center",
      elevation: 4,
    },
    summaryLabel: {
      color: theme.subText,
      fontSize: 12,
      textTransform: "uppercase",
    },
    totalAmount: {
      fontSize: 38,
      fontWeight: "900",
      marginVertical: 8,
      color: theme.text,
    },
    balanceSplit: { flexDirection: "row", gap: 15, marginTop: 10 },
    splitText: { fontSize: 13, color: theme.subText },
    sectionTitle: {
      paddingHorizontal: 20,
      marginVertical: 15,
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
    },
    cardList: { paddingLeft: 20, marginBottom: 10 },
    bankCard: {
      width: 260,
      marginRight: 15,
      backgroundColor: isDark ? "#2C3E50" : "#34495E",
      borderRadius: 24,
    },
    excludedCard: { opacity: 0.3 },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardSubTitle: { color: "#fff", opacity: 0.8, fontSize: 12 },
    balanceText: {
      color: "#fff",
      fontWeight: "bold",
      marginVertical: 8,
      fontSize: 22,
    },
    budgetSectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingRight: 20,
    },
    addBtn: { color: "#2ECC71", fontWeight: "bold" },
    categoriesContainer: { paddingHorizontal: 20, marginBottom: 10 },
    budgetRow: { marginBottom: 20 },
    budgetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    catName: { fontWeight: "600", color: theme.text },
    catStats: { color: theme.subText, fontSize: 12 },
    progressBar: {
      height: 10,
      borderRadius: 5,
      backgroundColor: isDark ? "#333" : "#E9ECEF",
    },
    transactionItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      marginHorizontal: 20,
      backgroundColor: theme.card,
      borderRadius: 20,
      marginBottom: 12,
      elevation: 1,
    },
    transIcon: { backgroundColor: isDark ? "#2A2A2A" : "#f0f0f0" },
    transDesc: { fontWeight: "bold", color: theme.text },
    transSub: { color: theme.subText, fontSize: 12 },
    transAmount: { fontWeight: "bold" },
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 90,
      backgroundColor: "#2ECC71",
      borderRadius: 30,
    },
    modalContent: {
      backgroundColor: theme.card,
      padding: 24,
      margin: 20,
      borderRadius: 24,
    },
    modalTitle: {
      marginBottom: 20,
      textAlign: "center",
      fontWeight: "bold",
      color: theme.text,
    },
    segmented: { marginBottom: 20 },
    modalInput: { marginBottom: 15 },
    inputLabel: { marginBottom: 8, color: theme.text },
    modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  });
