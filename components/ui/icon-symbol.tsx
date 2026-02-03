import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import React from "react";
import { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

/**
 * МАРШРУТИЗАЦІЯ ІКОНОК (MAPPING)
 * * Оскільки SF Symbols працюють лише на iOS, ми створюємо "словник".
 * Ключ (ліворуч) — це назва іконки в стилі Apple (SF Symbol).
 * Значення (праворуч) — це назва відповідної іконки з Material Icons для Android.
 */
const MAPPING = {
  // Стандартні іконки з шаблону
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",

  // Твої нові іконки для FinGrid
  "person.fill": "person", // Для вкладки "Профіль"
  "plus.circle.fill": "add-circle", // Для вкладки "Бюджет"
  "chart.pie.fill": "pie-chart", // Для вкладки "Аналітика"
  "creditcard.fill": "credit-card", // Може знадобитися для карток
  "gearshape.fill": "settings", // Для налаштувань
  "person.crop.circle.fill": "account-circle", // Іконка профілю в шапці
} as const;

// Типізація: дозволяємо використовувати лише ті назви, які є в нашому словнику MAPPING
type IconSymbolName = keyof typeof MAPPING;

/**
 * Компонент IconSymbol
 * * Цей компонент забезпечує кросплатформеність:
 * 1. На iOS він (теоретично) мав би малювати SF Symbols (через expo-symbols).
 * 2. На Android та Web він використовує MaterialIcons, підставляючи назву зі словника MAPPING.
 * * Примітка: В даній реалізації ми використовуємо MaterialIcons як основний рендер для обох платформ
 * задля стабільності відображення на Android.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight; // Вага символу (актуально переважно для iOS)
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
