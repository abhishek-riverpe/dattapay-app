import SignOutButton from "@/components/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#1A1A1A]">
      <SignedIn>
        <View className="flex-1">
          {/* Header */}
          <View className="bg-primary px-6 pt-4 pb-8 rounded-b-3xl">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-primary-100 text-sm">Welcome back</Text>
                <Text className="text-white text-xl font-bold">
                  {user?.firstName ||
                    user?.emailAddresses[0].emailAddress.split("@")[0]}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <ThemeToggle variant="icon" />
                <View className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center">
                  <Text className="text-white text-lg font-bold">
                    {(
                      user?.firstName?.[0] ||
                      user?.emailAddresses[0].emailAddress[0]
                    )?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Balance Card */}
            <View className="bg-white/10 rounded-2xl p-5">
              <Text className="text-primary-100 text-sm mb-1">
                Total Balance
              </Text>
              <Text className="text-white text-4xl font-bold">$0.00</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="px-6 -mt-4">
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm flex-row justify-around">
              <TouchableOpacity className="items-center">
                <View className="w-14 h-14 bg-primary-100 dark:bg-primary-900 rounded-full items-center justify-center mb-2">
                  <Text className="text-2xl">↑</Text>
                </View>
                <Text className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                  Send
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center">
                <View className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mb-2">
                  <Text className="text-2xl">↓</Text>
                </View>
                <Text className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                  Receive
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center">
                <View className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-full items-center justify-center mb-2">
                  <Text className="text-2xl">+</Text>
                </View>
                <Text className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                  Top Up
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center">
                <View className="w-14 h-14 bg-orange-100 dark:bg-orange-900 rounded-full items-center justify-center mb-2">
                  <Text className="text-2xl">⋯</Text>
                </View>
                <Text className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                  More
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View className="flex-1 px-6 mt-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 dark:text-white text-lg font-bold">
                Recent Activity
              </Text>
              <TouchableOpacity>
                <Text className="text-primary text-sm font-medium">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 items-center justify-center flex-1 max-h-48">
              <View className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
                <Text className="text-3xl">📋</Text>
              </View>
              <Text className="text-gray-900 dark:text-white font-semibold text-base mb-1">
                No transactions yet
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm text-center">
                Your recent activity will appear here
              </Text>
            </View>
          </View>

          {/* Account Info */}
          <View className="px-6 pb-6">
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mr-3">
                  <Text className="text-lg">✉️</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">
                    Email
                  </Text>
                  <Text className="text-gray-900 dark:text-white text-sm font-medium">
                    {user?.emailAddresses[0].emailAddress}
                  </Text>
                </View>
              </View>

              <View className="border-t border-gray-100 dark:border-gray-800 pt-3 mb-3">
                <ThemeToggle variant="row" />
              </View>

              <SignOutButton />
            </View>
          </View>
        </View>
      </SignedIn>

      <SignedOut>
        <View className="flex-1 px-6">
          {/* Hero Section */}
          <View className="flex-1 justify-center items-center">
            <View className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-3xl items-center justify-center mb-8">
              <Text className="text-5xl">💸</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-3">
              DattaPay
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-400 text-center mb-8 px-4">
              The simplest way to send, receive, and manage your money
            </Text>
          </View>

          {/* Auth Buttons */}
          <View className="pb-8">
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity className="w-full h-14 bg-primary rounded-xl items-center justify-center mb-3">
                <Text className="text-white text-base font-semibold">
                  Sign in
                </Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity className="w-full h-14 bg-gray-100 dark:bg-gray-800 rounded-xl items-center justify-center">
                <Text className="text-gray-900 dark:text-white text-base font-semibold">
                  Create account
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </SignedOut>
    </SafeAreaView>
  );
}
