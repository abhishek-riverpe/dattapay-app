import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "@/components/ui/EmptyState";

export default function ActivityScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#1A1A1A]">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Activity
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your transaction history
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 px-6">
          <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 flex-1 items-center justify-center">
            <EmptyState
              icon="📊"
              iconSize="xl"
              title="No activity yet"
              description="Your transactions will appear here once you start sending or receiving money."
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
