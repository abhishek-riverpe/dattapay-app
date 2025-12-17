import * as React from "react";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AppleSignInButton from "@/components/AppleSignInButton";
import { useTheme } from "@/context/ThemeContext";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const { isDark } = useTheme();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const placeholderColor = isDark ? "#6B7280" : "#9CA3AF";

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "An error occurred during sign up");
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }
            router.replace("/");
          },
        });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code");
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
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
            <View className="flex-1 px-6 pt-12">
              <View className="mb-8">
                <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Verify your email
                </Text>
                <Text className="text-base text-gray-600 dark:text-gray-400">
                  We've sent a verification code to {emailAddress}
                </Text>
              </View>

              {error ? (
                <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                  <Text className="text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </Text>
                </View>
              ) : null}

              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </Text>
                <TextInput
                  value={code}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={placeholderColor}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  className="w-full h-14 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-base text-center tracking-widest"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                onPress={onVerifyPress}
                disabled={isLoading || !code}
                className={`w-full h-14 rounded-xl items-center justify-center ${
                  isLoading || !code ? "bg-primary-300" : "bg-primary"
                }`}
              >
                <Text className="text-white text-base font-semibold">
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPendingVerification(false)}
                className="mt-4 items-center"
              >
                <Text className="text-primary text-sm font-medium">
                  Back to sign up
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

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
          <View className="flex-1 px-6 pt-12">
            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create account
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Sign up to get started with DattaPay
              </Text>
            </View>

            <AppleSignInButton />

            {error ? (
              <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <Text className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </Text>
              </View>
            ) : null}

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={emailAddress}
                placeholder="Enter your email"
                placeholderTextColor={placeholderColor}
                onChangeText={setEmailAddress}
                className="w-full h-14 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-base"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </Text>
              <TextInput
                value={password}
                placeholder="Create a password"
                placeholderTextColor={placeholderColor}
                secureTextEntry={true}
                onChangeText={setPassword}
                className="w-full h-14 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-base"
              />
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Must be at least 8 characters
              </Text>
            </View>

            <TouchableOpacity
              onPress={onSignUpPress}
              disabled={isLoading || !emailAddress || !password}
              className={`w-full h-14 rounded-xl items-center justify-center ${
                isLoading || !emailAddress || !password
                  ? "bg-primary-300"
                  : "bg-primary"
              }`}
            >
              <Text className="text-white text-base font-semibold">
                {isLoading ? "Creating account..." : "Create account"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Already have an account?{" "}
              </Text>
              <Link href="/sign-in" asChild>
                <TouchableOpacity>
                  <Text className="text-primary text-sm font-semibold">
                    Sign in
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-8 px-4">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
