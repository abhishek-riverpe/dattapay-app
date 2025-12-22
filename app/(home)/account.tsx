import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import SignOutButton from "@/components/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";
import IconCircle from "@/components/ui/IconCircle";
import useCurrentUser from "@/hooks/useCurrentUser";

export default function AccountScreen() {
  const { user } = useUser();
  const router = useRouter();
  const { data: currentUserResponse } = useCurrentUser();
  const currentUser = currentUserResponse?.data;
  const isAccountActive = currentUser?.accountStatus === "ACTIVE";

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#1A1A1A]">
      <ScrollView className="flex-1">
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
                      currentUser?.firstName?.[0] ||
                      user?.firstName?.[0] ||
                      user?.emailAddresses[0].emailAddress[0]
                    )?.toUpperCase()}
                  </Text>
                }
              />
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentUser?.firstName && currentUser?.lastName
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : user?.firstName || user?.emailAddresses[0].emailAddress.split("@")[0]}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUser?.email || user?.emailAddresses[0].emailAddress}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Not Active Warning */}
        {!isAccountActive && currentUser && (
          <Pressable
            onPress={() => router.push("/(account)/active-account")}
            className="px-6 mb-4"
          >
            <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <AlertTriangle size={20} color="#f59e0b" />
                <Text className="text-amber-800 dark:text-amber-300 text-sm font-medium ml-2">
                  Account Not Activated
                </Text>
              </View>
              <Text className="text-amber-700 dark:text-amber-400 text-sm">
                Activate your account to unlock all features.
              </Text>
              <Text className="text-amber-600 dark:text-amber-300 text-sm font-medium mt-2 underline">
                Activate Now
              </Text>
            </View>
          </Pressable>
        )}

        {/* Account Details */}
        <View className="px-6">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1">
            ACCOUNT DETAILS
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
                  {currentUser?.email || user?.emailAddresses[0].emailAddress}
                </Text>
              </View>
            </View>

            {/* Phone Row */}
            {currentUser?.phoneNumber && (
              <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800">
                <IconCircle icon="📱" size="sm" color="gray" className="mr-3" />
                <View className="flex-1">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">
                    Phone
                  </Text>
                  <Text className="text-gray-900 dark:text-white text-sm font-medium">
                    {currentUser.phoneNumberPrefix} {currentUser.phoneNumber}
                  </Text>
                </View>
              </View>
            )}

            {/* Nationality Row */}
            {currentUser?.nationality && (
              <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800">
                <IconCircle icon="🌍" size="sm" color="gray" className="mr-3" />
                <View className="flex-1">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">
                    Nationality
                  </Text>
                  <Text className="text-gray-900 dark:text-white text-sm font-medium">
                    {currentUser.nationality}
                  </Text>
                </View>
              </View>
            )}

            {/* Account Status Row */}
            {currentUser && (
              <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800">
                <IconCircle icon="✓" size="sm" color="gray" className="mr-3" />
                <View className="flex-1">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">
                    Account Status
                  </Text>
                  <Text
                    className={`text-sm font-medium ${
                      isAccountActive
                        ? "text-green-600 dark:text-green-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {currentUser.accountStatus}
                  </Text>
                </View>
              </View>
            )}

            {/* Update Profile */}
            <Pressable
              onPress={() => router.push("/(account)/complete-account")}
              className="flex-row items-center p-4"
            >
              <IconCircle icon="✏️" size="sm" color="gray" className="mr-3" />
              <View className="flex-1">
                <Text className="text-gray-900 dark:text-white text-sm font-medium">
                  Update Profile
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">›</Text>
            </Pressable>
          </View>
        </View>

        {/* Preferences */}
        <View className="px-6 mt-4">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1">
            PREFERENCES
          </Text>
          <View className="bg-white dark:bg-gray-900 rounded-2xl">
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
        <View className="px-6 pt-6">
          <Text className="text-center text-xs text-gray-400 dark:text-gray-600">
            DattaPay v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
