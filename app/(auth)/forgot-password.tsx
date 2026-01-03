import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ThemeButton from "@/components/ui/ThemeButton";
import ThemeTextInput from "@/components/ui/ThemeTextInput";
import {
  forgotPasswordEmailSchema,
  resetPasswordSchema,
  ForgotPasswordEmailFormData,
  ResetPasswordFormData,
} from "@/schemas";

export default function ForgotPasswordScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [showResetForm, setShowResetForm] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    formState: { isValid: isEmailValid },
  } = useForm<ForgotPasswordEmailFormData>({
    resolver: yupResolver(forgotPasswordEmailSchema),
    mode: "onChange",
    defaultValues: {
      emailAddress: "",
    },
  });

  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    formState: { isValid: isResetValid },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onRequestReset = React.useCallback(
    async (data: ForgotPasswordEmailFormData) => {
      if (!isLoaded) return;

      setIsLoading(true);
      setServerError("");
      setSuccessMessage("");

      try {
        await signIn.create({
          strategy: "reset_password_email_code",
          identifier: data.emailAddress,
        });

        setSuccessMessage("A reset code has been sent to your email.");
        setShowResetForm(true);
      } catch (err) {
        const error = err as { errors?: { message?: string }[] };
        setServerError(
          error.errors?.[0]?.message || "An error occurred. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded, signIn]
  );

  const onResetPassword = React.useCallback(
    async (data: ResetPasswordFormData) => {
      if (!isLoaded) return;

      setIsLoading(true);
      setServerError("");

      try {
        const result = await signIn.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code: data.code,
          password: data.password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.replace("/(account)");
        }
      } catch (err) {
        const error = err as { errors?: { message?: string }[] };
        setServerError(
          error.errors?.[0]?.message || "Failed to reset password. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded, signIn, setActive, router]
  );

  if (showResetForm) {
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
                  Reset password
                </Text>
                <Text className="text-base text-gray-600 dark:text-gray-400">
                  Enter the code sent to your email and your new password.
                </Text>
              </View>

              {successMessage ? (
                <View className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                  <Text className="text-green-600 dark:text-green-400 text-sm">
                    {successMessage}
                  </Text>
                </View>
              ) : null}

              {serverError ? (
                <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                  <Text className="text-red-600 dark:text-red-400 text-sm">
                    {serverError}
                  </Text>
                </View>
              ) : null}

              <View className="mb-4">
                <Controller
                  name="code"
                  control={resetControl}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <ThemeTextInput
                      variant="code"
                      label="Reset Code"
                      placeholder="Enter 6-digit code"
                      value={value}
                      onChangeText={onChange}
                      errorMessage={error?.message}
                    />
                  )}
                />
              </View>

              <View className="mb-4">
                <Controller
                  name="password"
                  control={resetControl}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <ThemeTextInput
                      variant="password"
                      label="New Password"
                      placeholder="Enter new password"
                      value={value}
                      onChangeText={onChange}
                      errorMessage={error?.message}
                    />
                  )}
                />
              </View>

              <View className="mb-6">
                <Controller
                  name="confirmPassword"
                  control={resetControl}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <ThemeTextInput
                      variant="password"
                      label="Confirm Password"
                      placeholder="Confirm new password"
                      value={value}
                      onChangeText={onChange}
                      errorMessage={error?.message}
                    />
                  )}
                />
              </View>

              <ThemeButton
                variant="primary"
                onPress={handleResetSubmit(onResetPassword)}
                disabled={!isResetValid}
                loading={isLoading}
              >
                Reset Password
              </ThemeButton>

              <ThemeButton
                variant="ghost"
                onPress={() => {
                  setShowResetForm(false);
                  setSuccessMessage("");
                  setServerError("");
                }}
                className="mt-4"
              >
                Back
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
                Forgot password?
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you a code to reset your
                password.
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
                name="emailAddress"
                control={emailControl}
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

            <ThemeButton
              variant="primary"
              onPress={handleEmailSubmit(onRequestReset)}
              disabled={!isEmailValid}
              loading={isLoading}
            >
              Send Reset Code
            </ThemeButton>

            <ThemeButton
              variant="ghost"
              onPress={() => router.back()}
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
