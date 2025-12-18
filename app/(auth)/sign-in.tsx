import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React from "react";
import type { EmailCodeFactor } from "@clerk/types";
import { SafeAreaView } from "react-native-safe-area-context";
import AppleSignInButton from "@/components/AppleSignInButton";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import ThemeButton from "@/components/ui/ThemeButton";
import ThemeTextInput from "@/components/ui/ThemeTextInput";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showEmailCode, setShowEmailCode] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }
            router.replace("/(account)/complete-account");
          },
        });
      } else if (signInAttempt.status === "needs_second_factor") {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor => factor.strategy === "email_code"
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setShowEmailCode(true);
        }
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "An error occurred during sign in");
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, emailAddress, password]);

  const onVerifyPress = React.useCallback(async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }
            router.replace("/(account)/complete-account");
          },
        });
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code");
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, code]);

  if (showEmailCode) {
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
                  A verification code has been sent to your email address.
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
                Verify
              </ThemeButton>

              <ThemeButton
                variant="ghost"
                onPress={() => setShowEmailCode(false)}
                className="mt-4"
              >
                Back to sign in
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
                Welcome back
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Sign in to your DattaPay account
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
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <ThemeButton
              variant="primary"
              onPress={onSignInPress}
              disabled={!emailAddress || !password}
              loading={isLoading}
            >
              Sign in
            </ThemeButton>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Don't have an account?{" "}
              </Text>
              <Link href="/sign-up" asChild>
                <ThemeButton variant="link" onPress={() => {}}>
                  Sign up
                </ThemeButton>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
