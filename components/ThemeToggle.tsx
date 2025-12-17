import { TouchableOpacity, View, Text } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  variant?: "icon" | "row";
}

export default function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const { isDark, toggleTheme, themeMode } = useTheme();

  if (variant === "icon") {
    return (
      <TouchableOpacity
        onPress={toggleTheme}
        className="w-10 h-10 bg-primary-500/20 rounded-full items-center justify-center"
        accessibilityLabel={`Switch to ${isDark ? "light" : "dark"} mode`}
        accessibilityRole="button"
      >
        <Text className="text-lg">{isDark ? "☀️" : "🌙"}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className="flex-row items-center py-3"
      accessibilityLabel={`Switch to ${isDark ? "light" : "dark"} mode`}
      accessibilityRole="button"
    >
      <View className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mr-3">
        <Text className="text-lg">{isDark ? "☀️" : "🌙"}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 dark:text-gray-400 text-xs">
          Appearance
        </Text>
        <Text className="text-gray-900 dark:text-white text-sm font-medium">
          {themeMode === "system"
            ? `System (${isDark ? "Dark" : "Light"})`
            : isDark
              ? "Dark Mode"
              : "Light Mode"}
        </Text>
      </View>
      <View className="w-12 h-7 bg-gray-200 dark:bg-gray-700 rounded-full p-1">
        <View
          className={`w-5 h-5 rounded-full ${isDark ? "bg-primary ml-auto" : "bg-white"}`}
        />
      </View>
    </TouchableOpacity>
  );
}
