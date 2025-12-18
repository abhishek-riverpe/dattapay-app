import * as React from "react";
import {
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AppleSignInButton from "@/components/AppleSignInButton";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import ThemeButton from "@/components/ui/ThemeButton";
import ThemeTextInput from "@/components/ui/ThemeTextInput";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

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
            router.replace("/(account)/complete-account");
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
                <ThemeTextInput
                  variant="code"
                  label="Verification Code"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChangeText={setCode}
                />
              </View>

              <ThemeButton
                variant="primary"
                onPress={onVerifyPress}
                disabled={!code}
                loading={isLoading}
              >
                Verify Email
              </ThemeButton>

              <ThemeButton
                variant="ghost"
                onPress={() => setPendingVerification(false)}
                className="mt-4"
              >
                Back to sign up
              </ThemeButton>
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

            <GoogleSignInButton />
            <AppleSignInButton showDivider={false} />

            <View className="flex-row items-center my-5">
              <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <Text className="mx-4 text-gray-500 dark:text-gray-400 text-sm">
                OR
              </Text>
              <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </View>

            {error ? (
              <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <Text className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </Text>
              </View>
            ) : null}

            <View className="mb-4">
              <ThemeTextInput
                variant="email"
                label="Email"
                placeholder="Enter your email"
                value={emailAddress}
                onChangeText={setEmailAddress}
              />
            </View>

            <View className="mb-6">
              <ThemeTextInput
                variant="password"
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
              />
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Must be at least 8 characters
              </Text>
            </View>

            <ThemeButton
              variant="primary"
              onPress={onSignUpPress}
              disabled={!emailAddress || !password}
              loading={isLoading}
            >
              Create account
            </ThemeButton>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Already have an account?{" "}
              </Text>
              <Link href="/sign-in" asChild>
                <ThemeButton variant="link" onPress={() => {}}>
                  Sign in
                </ThemeButton>
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
