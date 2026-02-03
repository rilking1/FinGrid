import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  Button,
  Card,
  SegmentedButtons,
  Text,
  TextInput,
} from "react-native-paper";

export default function BudgetScreen() {
  const [operationType, setOperationType] = useState("expense");
  const [amount, setAmount] = useState("");

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.header}>
          Керування бюджетом
        </ThemedText>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 10 }}>
              Нова операція
            </Text>
            <SegmentedButtons
              value={operationType}
              onValueChange={setOperationType}
              buttons={[
                { value: "expense", label: "Витрата" },
                { value: "income", label: "Прибуток" },
              ]}
            />
            <TextInput
              label="Сума"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
            <Button mode="contained" onPress={() => {}} style={styles.button}>
              Додати в історію
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  header: { marginBottom: 20 },
  card: { borderRadius: 20, elevation: 2 },
  input: { marginTop: 15 },
  button: { marginTop: 15, borderRadius: 10 },
});
