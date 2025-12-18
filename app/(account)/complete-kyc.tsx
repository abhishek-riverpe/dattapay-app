import * as React from "react";
import {
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Shield, FileCheck, Camera, CheckCircle } from "lucide-react-native";
import ThemeButton from "@/components/ui/ThemeButton";
import { useTheme } from "@/context/ThemeContext";

interface KYCStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

export default function CompleteKYCScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [kycSteps, setKycSteps] = React.useState<KYCStep[]>([
    {
      id: "identity",
      title: "Identity Verification",
      description: "Upload a government-issued ID (Passport, Driver's License, or National ID)",
      icon: <FileCheck size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />,
      completed: false,
    },
    {
      id: "selfie",
      title: "Selfie Verification",
      description: "Take a selfie to match with your ID photo",
      icon: <Camera size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />,
      completed: false,
    },
    {
      id: "address",
      title: "Proof of Address",
      description: "Upload a utility bill or bank statement (not older than 3 months)",
      icon: <Shield size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />,
      completed: false,
    },
  ]);

  const allStepsCompleted = kycSteps.every((step) => step.completed);

  const handleStepPress = (stepId: string) => {
    // In a real app, this would open a document picker or camera
    // For now, we'll simulate completing the step
    setKycSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const handleSubmitKYC = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Simulate API call for KYC submission
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to home after successful KYC
      router.replace("/(home)");
    } catch (err: any) {
      setError(err.message || "Failed to submit KYC verification");
      console.error("KYC submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipForNow = () => {
    // Allow users to skip KYC and go to home
    // They can complete it later from account settings
    router.replace("/(home)");
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
                <Shield size={32} color="#005AEE" />
              </View>
              <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                KYC Verification
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Complete your identity verification to unlock all features and higher transaction limits.
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

            {/* KYC Steps */}
            <View className="mb-8">
              {kycSteps.map((step) => (
                <View
                  key={step.id}
                  className={`flex-row items-start p-4 rounded-xl mb-3 ${
                    step.completed
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      : "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <View
                    className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                      step.completed
                        ? "bg-green-100 dark:bg-green-900/40"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle size={24} color="#22C55E" />
                    ) : (
                      step.icon
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-base font-semibold mb-1 ${
                        step.completed
                          ? "text-green-700 dark:text-green-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {step.title}
                    </Text>
                    <Text
                      className={`text-sm ${
                        step.completed
                          ? "text-green-600 dark:text-green-500"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {step.completed ? "Completed" : step.description}
                    </Text>
                    {!step.completed && (
                      <ThemeButton
                        variant="ghost"
                        size="sm"
                        fullWidth={false}
                        onPress={() => handleStepPress(step.id)}
                        className="mt-2"
                      >
                        Upload Document
                      </ThemeButton>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Info Box */}
            <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
              <Text className="text-blue-800 dark:text-blue-300 text-sm font-medium mb-1">
                Why is this needed?
              </Text>
              <Text className="text-blue-700 dark:text-blue-400 text-sm">
                KYC verification helps us comply with financial regulations and protect your account from unauthorized access.
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="mb-6">
              <ThemeButton
                variant="primary"
                onPress={handleSubmitKYC}
                disabled={!allStepsCompleted}
                loading={isLoading}
              >
                {allStepsCompleted ? "Complete Verification" : "Complete All Steps Above"}
              </ThemeButton>

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
