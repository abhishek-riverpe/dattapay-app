import { Link, Stack } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "@/components/ui/EmptyState";
import ThemeButton from "@/components/ui/ThemeButton";

export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <Stack.Screen options={{ title: "Not Found", headerShown: false }} />
      <View className="flex-1 items-center justify-center px-6">
        <EmptyState
          icon="🔍"
          iconSize="xl"
          title="Page not found"
          description="The page you're looking for doesn't exist or has been moved."
          action={
            <Link href="/" asChild>
              <ThemeButton variant="primary" fullWidth={false} onPress={() => {}}>
                Go to Home
              </ThemeButton>
            </Link>
          }
        />
      </View>
    </SafeAreaView>
  );
}
