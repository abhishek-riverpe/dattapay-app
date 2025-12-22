import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useTheme } from "@/context/ThemeContext";

export default function AuthLayout() {
  const { isSignedIn } = useAuth();
  const { isDark } = useTheme();

  if (isSignedIn) {
    return <Redirect href={"/(account)"} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? "#121212" : "white" },
        animation: "slide_from_right",
      }}
    />
  );
}
