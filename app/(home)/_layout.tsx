import { Stack } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

export default function HomeLayout() {
  const { isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? "#1A1A1A" : "#F9FAFB" },
        animation: "fade",
      }}
    />
  );
}
