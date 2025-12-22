import ThemeButton from "@/components/ui/ThemeButton";
import { useTheme } from "@/context/ThemeContext";
import apiClient from "@/lib/api-client";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { CheckCircle, MapPin, Rocket, User } from "lucide-react-native";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActiveAccountScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleActivateAccount = async () => {
    setIsLoading(true);
    setError("");

    try {
      await apiClient.post("/zynk/entities");
      router.replace("/(account)/complete-kyc");
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data.message || "Failed to activate account");
      } else {
        setError("Failed to activate account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPersonalInfo = () => {
    router.push("/(account)/complete-account");
  };

  const handleEditAddress = () => {
    router.push("/(account)/complete-address");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-6">
            {/* Header */}
            <View className="mb-8">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <Rocket size={32} color="#005AEE" />
              </View>
              <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Activate Your Account
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Review your information and activate your account to continue.
              </Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <Text className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Completed Steps */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Completed Steps
              </Text>

              {/* Personal Info Card */}
              <Pressable
                onPress={handleEditPersonalInfo}
                className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-3"
              >
                <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                  <User size={20} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900 dark:text-white">
                    Personal Information
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Tap to review or edit
                  </Text>
                </View>
                <CheckCircle size={24} color="#22c55e" />
              </Pressable>

              {/* Address Card */}
              <Pressable
                onPress={handleEditAddress}
                className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
              >
                <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                  <MapPin size={20} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900 dark:text-white">
                    Address Details
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Tap to review or edit
                  </Text>
                </View>
                <CheckCircle size={24} color="#22c55e" />
              </Pressable>
            </View>

            {/* Info Box */}
            <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
              <Text className="text-blue-800 dark:text-blue-300 text-sm font-medium mb-1">
                What happens next?
              </Text>
              <Text className="text-blue-700 dark:text-blue-400 text-sm">
                After activating your account, you'll be guided through the KYC
                verification process to unlock all features.
              </Text>
            </View>

            {/* Activate Button */}
            <View className="mb-6">
              <ThemeButton
                variant="primary"
                onPress={handleActivateAccount}
                loading={isLoading}
              >
                Activate Account
              </ThemeButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
