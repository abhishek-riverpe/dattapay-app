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
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import AppleSignInButton from "@/components/AppleSignInButton";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import ThemeButton from "@/components/ui/ThemeButton";
import ThemeTextInput from "@/components/ui/ThemeTextInput";
import { refreshAdminToken } from "@/lib/token-generator";
import {
  signInSchema,
  verificationCodeSchema,
  SignInFormData,
  VerificationCodeFormData,
} from "@/schemas";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [showEmailCode, setShowEmailCode] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState("");

  // Sign in form
  const {
    control: signInControl,
    handleSubmit: handleSignInSubmit,
    formState: { isValid: isSignInValid },
  } = useForm<SignInFormData>({
    resolver: yupResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      emailAddress: "",
      password: "",
    },
  });

  // Verification form
  const {
    control: verifyControl,
    handleSubmit: handleVerifySubmit,
    formState: { isValid: isVerifyValid },
  } = useForm<VerificationCodeFormData>({
    resolver: yupResolver(verificationCodeSchema),
    mode: "onChange",
    defaultValues: {
      code: "",
    },
  });

  const onSignInPress = React.useCallback(
    async (data: SignInFormData) => {
      if (!isLoaded) return;

      setIsLoading(true);
      setServerError("");

      try {
        const signInAttempt = await signIn.create({
          identifier: data.emailAddress,
          password: data.password,
        });

        if (signInAttempt.status === "complete") {
          await refreshAdminToken();
          await setActive({
            session: signInAttempt.createdSessionId,
            navigate: async ({ session }) => {
              if (session?.currentTask) {
                return;
              }
              router.replace("/(account)");
            },
          });
        } else if (signInAttempt.status === "needs_second_factor") {
          const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
            (factor): factor is EmailCodeFactor =>
              factor.strategy === "email_code"
          );

          if (emailCodeFactor) {
            await signIn.prepareSecondFactor({
              strategy: "email_code",
              emailAddressId: emailCodeFactor.emailAddressId,
            });
            setShowEmailCode(true);
          }
        } else {
          // Sign-in requires additional steps
        }
      } catch (err) {
        const error = err as { errors?: { message?: string }[] };
        setServerError(
          error.errors?.[0]?.message || "An error occurred during sign in"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded]
  );

  const onVerifyPress = React.useCallback(
    async (data: VerificationCodeFormData) => {
      if (!isLoaded) return;

      setIsLoading(true);
      setServerError("");

      try {
        const signInAttempt = await signIn.attemptSecondFactor({
          strategy: "email_code",
          code: data.code,
        });

        if (signInAttempt.status === "complete") {
          await refreshAdminToken();
          await setActive({
            session: signInAttempt.createdSessionId,
            navigate: async ({ session }) => {
              if (session?.currentTask) {
                return;
              }
              router.replace("/(account)");
            },
          });
        } else {
          // Verification requires additional steps
        }
      } catch (err) {
        const error = err as { errors?: { message?: string }[] };
        setServerError(error.errors?.[0]?.message || "Invalid verification code");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded]
  );

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

              {serverError ? (
                <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                  <Text className="text-red-600 dark:text-red-400 text-sm">
                    {serverError}
                  </Text>
                </View>
              ) : null}

              <View className="mb-6">
                <Controller
                  name="code"
                  control={verifyControl}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <ThemeTextInput
                      variant="code"
                      label="Verification Code"
                      placeholder="Enter 6-digit code"
                      value={value}
                      onChangeText={onChange}
                      errorMessage={error?.message}
                    />
                  )}
                />
              </View>

              <ThemeButton
                variant="primary"
                onPress={handleVerifySubmit(onVerifyPress)}
                disabled={!isVerifyValid}
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
                Sign in to your DattaPay account to continue.
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

            {serverError ? (
              <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <Text className="text-red-600 dark:text-red-400 text-sm">
                  {serverError}
                </Text>
              </View>
            ) : null}

            <View className="mb-4">
              <Controller
                name="emailAddress"
                control={signInControl}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <ThemeTextInput
                    variant="email"
                    label="Email"
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={error?.message}
                  />
                )}
              />
            </View>

            <View className="mb-2">
              <Controller
                name="password"
                control={signInControl}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <ThemeTextInput
                    variant="password"
                    label="Password"
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={error?.message}
                  />
                )}
              />
            </View>

            <View className="flex-row justify-end mb-6">
              <Link href="/forgot-password" asChild>
                <ThemeButton variant="link" onPress={() => {}}>
                  Forgot password?
                </ThemeButton>
              </Link>
            </View>

            <ThemeButton
              variant="primary"
              onPress={handleSignInSubmit(onSignInPress)}
              disabled={!isSignInValid}
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
