import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useTheme } from "@/context/ThemeContext";
import useCurrentUser from "@/hooks/useCurrentUser";
import { Home, Clock, Wallet, User } from "lucide-react-native";
import BiometricLock from "@/components/BiometricLock";

export default function HomeLayout() {
  const { isSignedIn } = useAuth();
  const { isDark } = useTheme();
  const { data: currentUserResponse } = useCurrentUser();
  const currentUser = currentUserResponse?.data;

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!currentUser) {
    return <Redirect href="/(account)/complete-account" />;
  }

  return (
    <BiometricLock>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark ? "#111111" : "#FFFFFF",
            borderTopColor: isDark ? "#1F1F1F" : "#F3F4F6",
            borderTopWidth: 1,
            height: 85,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: "#005AEE",
          tabBarInactiveTintColor: isDark ? "#6B7280" : "#9CA3AF",
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: "Activity",
            tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: "Wallet",
            tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </BiometricLock>
  );
}
