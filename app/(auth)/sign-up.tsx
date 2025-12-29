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
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import AppleSignInButton from "@/components/AppleSignInButton";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import ThemeButton from "@/components/ui/ThemeButton";
import ThemeTextInput from "@/components/ui/ThemeTextInput";
import {
  signUpSchema,
  verificationCodeSchema,
  SignUpFormData,
  VerificationCodeFormData,
} from "@/schemas";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState("");

  // Sign up form
  const {
    control: signUpControl,
    handleSubmit: handleSignUpSubmit,
    formState: { isValid: isSignUpValid },
    getValues,
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      emailAddress: "",
      password: "",
      confirmPassword: "",
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

  const onSignUpPress = async (data: SignUpFormData) => {
    if (!isLoaded) return;

    setIsLoading(true);
    setServerError("");

    try {
      await signUp.create({
        emailAddress: data.emailAddress,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      setServerError(
        err.errors?.[0]?.message || "An error occurred during sign up"
      );
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async (data: VerificationCodeFormData) => {
    if (!isLoaded) return;

    setIsLoading(true);
    setServerError("");

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: data.code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }
            router.replace("/(account)");
          },
        });
        router.replace("/(account)");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      setServerError(err.errors?.[0]?.message || "Invalid verification code");
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
                  We've sent a verification code to {getValues("emailAddress")}
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
                Create your account
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Get paid in USD and auto-convert to USDC.
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
                control={signUpControl}
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

            <View className="mb-4">
              <Controller
                name="password"
                control={signUpControl}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <>
                    <ThemeTextInput
                      variant="password"
                      label="Password"
                      placeholder="Create a password"
                      value={value}
                      onChangeText={onChange}
                      errorMessage={error?.message}
                    />
                    {!error && (
                      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Must be at least 8 characters
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            <View className="mb-6">
              <Controller
                name="confirmPassword"
                control={signUpControl}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <ThemeTextInput
                    variant="password"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={error?.message}
                  />
                )}
              />
            </View>

            <ThemeButton
              variant="primary"
              onPress={handleSignUpSubmit(onSignUpPress)}
              disabled={!isSignUpValid}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
