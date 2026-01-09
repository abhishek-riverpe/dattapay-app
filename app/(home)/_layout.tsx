import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useTheme } from "@/context/ThemeContext";
import useAccount from "@/hooks/useAccount";
import { Home, Clock, Wallet, User } from "lucide-react-native";
import BiometricLock from "@/components/BiometricLock";

// Extract tab icon render functions outside the component
const renderHomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Home size={size} color={color} />
);

const renderFundsIcon = ({ color, size }: { color: string; size: number }) => (
  <Wallet size={size} color={color} />
);

const renderActivityIcon = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => <Clock size={size} color={color} />;

const renderAccountIcon = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => <User size={size} color={color} />;

export default function HomeLayout() {
  const { isSignedIn } = useAuth();
  const { isDark } = useTheme();
  const { data: currentUserResponse } = useAccount();
  const currentUser = currentUserResponse?.data;

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!currentUser?.user) {
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
            tabBarIcon: renderHomeIcon,
          }}
        />
        <Tabs.Screen
          name="funds"
          options={{
            title: "Funds",
            tabBarIcon: renderFundsIcon,
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: "Activity",
            tabBarIcon: renderActivityIcon,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            tabBarIcon: renderAccountIcon,
          }}
        />
      </Tabs>
    </BiometricLock>
  );
}
