import ThemeButton from "@/components/ui/ThemeButton";
import { useTheme } from "@/context/ThemeContext";
import apiClient from "@/lib/api-client";
import { useKycStore } from "@/store";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { FileCheck, FileText, Shield } from "lucide-react-native";
import * as React from "react";
import * as Linking from "expo-linking";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompleteKYCScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { kycLink, tosLink, setKycData } = useKycStore();

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleStartKYC = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/zynk/kyc");
      const { kycLink, tosLink, kycStatus, tosStatus } = response.data.data;
      setKycData({ kycLink, tosLink, kycStatus, tosStatus });
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data.message || "Failed to start KYC");
      } else {
        setError("Failed to start KYC verification");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenKycLink = () => {
    if (kycLink) {
      Linking.openURL(kycLink);
    }
  };

  const handleOpenTosLink = () => {
    if (tosLink) {
      Linking.openURL(tosLink);
    }
  };

  const handleSkipForNow = () => {
    router.replace("/(home)");
  };

  const hasKycData = kycLink && tosLink;

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
                <Shield size={32} color="#005AEE" />
              </View>
              <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                KYC Verification
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Complete your identity verification to unlock all features and
                higher transaction limits.
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

            {/* Info Box */}
            <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
              <Text className="text-blue-800 dark:text-blue-300 text-sm font-medium mb-1">
                Why is this needed?
              </Text>
              <Text className="text-blue-700 dark:text-blue-400 text-sm">
                KYC verification helps us comply with financial regulations and
                protect your account from unauthorized access.
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="mb-6">
              {!hasKycData ? (
                <ThemeButton
                  variant="primary"
                  onPress={handleStartKYC}
                  loading={isLoading}
                >
                  Start KYC
                </ThemeButton>
              ) : (
                <View className="gap-3">
                  <ThemeButton
                    variant="primary"
                    onPress={handleOpenKycLink}
                    className="flex-row items-center justify-center gap-2"
                  >
                    <FileCheck size={20} color="#fff" />
                    <Text className="text-white font-semibold">Complete KYC Verification</Text>
                  </ThemeButton>
                  <ThemeButton
                    variant="secondary"
                    onPress={handleOpenTosLink}
                    className="flex-row items-center justify-center gap-2"
                  >
                    <FileText size={20} color={isDark ? "#fff" : "#005AEE"} />
                    <Text className={isDark ? "text-white font-semibold" : "text-primary font-semibold"}>
                      Accept Terms of Service
                    </Text>
                  </ThemeButton>
                </View>
              )}

              <ThemeButton
                variant="ghost"
                onPress={handleSkipForNow}
                className="mt-3"
              >
                Skip for now
              </ThemeButton>
              <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                You can complete KYC later from your account settings
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
