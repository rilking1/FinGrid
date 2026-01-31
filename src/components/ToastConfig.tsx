import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper"; // Використовуємо іконки Paper
import { ToastConfig } from "react-native-toast-message";

export const toastConfig: ToastConfig = {
  // 1. Успішне повідомлення (Зелене)
  success: (props) => (
    <View style={[styles.container, styles.successBorder]}>
      <View style={styles.iconContainer}>
        <IconButton icon="check-circle" iconColor="#2ECC71" size={24} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        <Text style={styles.message}>{props.text2}</Text>
      </View>
    </View>
  ),

  // 2. Помилка (Червоне)
  error: (props) => (
    <View style={[styles.container, styles.errorBorder]}>
      <View style={styles.iconContainer}>
        <IconButton icon="alert-circle" iconColor="#E74C3C" size={24} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        <Text style={styles.message}>{props.text2}</Text>
      </View>
    </View>
  ),

  // 3. Інформаційне (Синє)
  info: (props) => (
    <View style={[styles.container, styles.infoBorder]}>
      <View style={styles.iconContainer}>
        <IconButton icon="information" iconColor="#3498DB" size={24} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        <Text style={styles.message}>{props.text2}</Text>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    width: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // Тінь для Android
    borderLeftWidth: 6, // Кольорова смужка збоку
  },
  successBorder: { borderLeftColor: "#2ECC71" },
  errorBorder: { borderLeftColor: "#E74C3C" },
  infoBorder: { borderLeftColor: "#3498DB" },

  iconContainer: {
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  message: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
});
