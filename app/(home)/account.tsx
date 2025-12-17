import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import SignOutButton from "@/components/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";
import IconCircle from "@/components/ui/IconCircle";

export default function AccountScreen() {
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#1A1A1A]">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Account
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your profile and settings
          </Text>
        </View>

        {/* Profile Card */}
        <View className="px-6 mb-4">
          <View className="bg-white dark:bg-gray-900 rounded-2xl p-5">
            <View className="flex-row items-center">
              <IconCircle
                size="xl"
                color="primary"
                icon={
                  <Text className="text-primary text-3xl font-bold">
                    {(
                      user?.firstName?.[0] ||
                      user?.emailAddresses[0].emailAddress[0]
                    )?.toUpperCase()}
                  </Text>
                }
              />
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user?.firstName || user?.emailAddresses[0].emailAddress.split("@")[0]}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.emailAddresses[0].emailAddress}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View className="px-6">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1">
            PREFERENCES
          </Text>
          <View className="bg-white dark:bg-gray-900 rounded-2xl">
            {/* Email Row */}
            <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800">
              <IconCircle icon="✉️" size="sm" color="gray" className="mr-3" />
              <View className="flex-1">
                <Text className="text-gray-500 dark:text-gray-400 text-xs">
                  Email
                </Text>
                <Text className="text-gray-900 dark:text-white text-sm font-medium">
                  {user?.emailAddresses[0].emailAddress}
                </Text>
              </View>
            </View>

            {/* Theme Toggle Row */}
            <View className="p-4">
              <ThemeToggle variant="row" />
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <View className="px-6 mt-4">
          <View className="bg-white dark:bg-gray-900 rounded-2xl p-4">
            <SignOutButton />
          </View>
        </View>

        {/* App Info */}
        <View className="flex-1 justify-end px-6 pb-6">
          <Text className="text-center text-xs text-gray-400 dark:text-gray-600">
            DattaPay v1.0.0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
