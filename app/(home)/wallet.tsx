import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "@/components/ui/EmptyState";
import ThemeButton from "@/components/ui/ThemeButton";

export default function WalletScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#1A1A1A]">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Wallet
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your cards and accounts
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 px-6">
          <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 flex-1 items-center justify-center">
            <EmptyState
              icon="💳"
              iconSize="xl"
              title="No cards added"
              description="Add a debit or credit card to start making payments."
              action={
                <ThemeButton
                  variant="primary"
                  fullWidth={false}
                  onPress={() => {}}
                >
                  Add Card
                </ThemeButton>
              }
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
