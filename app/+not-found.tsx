import { Link, Stack } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <Stack.Screen options={{ title: "Not Found", headerShown: false }} />
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-6">
          <Text className="text-5xl">🔍</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page not found
        </Text>
        <Text className="text-base text-gray-600 dark:text-gray-400 text-center mb-8">
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Link href="/" asChild>
          <TouchableOpacity className="bg-primary px-8 py-4 rounded-xl">
            <Text className="text-white text-base font-semibold">
              Go to Home
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
