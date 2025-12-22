import ThemeButton from "@/components/ui/ThemeButton";
import ThemeTextInput from "@/components/ui/ThemeTextInput";
import useCurrentUser from "@/hooks/useCurrentUser";
import apiClient from "@/lib/api-client";
import { PersonalInfoFormData, personalInfoSchema } from "@/schemas";
import { useUser } from "@clerk/clerk-expo";
import { yupResolver } from "@hookform/resolvers/yup";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompleteAccountScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { data: currentUserResponse } = useCurrentUser();
  const currentUser = currentUserResponse?.data;

  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    resolver: yupResolver(personalInfoSchema),
    mode: "onChange",
    defaultValues: {
      clerkUserId: user?.id || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.emailAddresses[0]?.emailAddress || "",
      phoneNumberPrefix: "+1",
      phoneNumber: "",
      nationality: "",
      dateOfBirth: "",
    },
  });

  React.useEffect(() => {
    if (currentUser) {
      const dateOfBirth =
        currentUser.dateOfBirth instanceof Date
          ? currentUser.dateOfBirth.toISOString().split("T")[0]
          : String(currentUser.dateOfBirth).split("T")[0];

      reset({
        clerkUserId: currentUser.clerkUserId,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phoneNumberPrefix: currentUser.phoneNumberPrefix,
        phoneNumber: currentUser.phoneNumber,
        nationality: currentUser.nationality,
        dateOfBirth: dateOfBirth,
      });
    }
  }, [currentUser, reset]);

  const onSubmit = async (data: PersonalInfoFormData) => {
    setIsLoading(true);
    setServerError("");

    try {
      const userId = 1;
      await apiClient.post("/users", data);
      router.push({
        pathname: "/(account)/complete-address",
        params: { userId: userId.toString() },
      });
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        alert(err.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

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
            <View className="mb-6">
              <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Personal Information
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Let's start with your basic details
              </Text>
            </View>

            {/* Server Error Message */}
            {serverError ? (
              <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <Text className="text-red-600 dark:text-red-400 text-sm">
                  {serverError}
                </Text>
              </View>
            ) : null}

            {/* Form Fields */}
            <View className="mb-4">
              <Controller
                name="firstName"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <ThemeTextInput
                    label="First Name"
                    placeholder="Enter your first name"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={error?.message}
                  />
                )}
              />
            </View>

            <View className="mb-4">
              <Controller
                name="lastName"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <ThemeTextInput
                    label="Last Name"
                    placeholder="Enter your last name"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={error?.message}
                  />
                )}
              />
            </View>

            <View className="mb-4">
              <Controller
                name="email"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <ThemeTextInput
                    variant="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={error?.message}
                  />
                )}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </Text>
              <View className="flex-row">
                <View className="w-24 mr-2">
                  <Controller
                    name="phoneNumberPrefix"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <ThemeTextInput
                        placeholder="+1"
                        value={value}
                        onChangeText={onChange}
                        errorMessage={error?.message}
                      />
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <ThemeTextInput
                        placeholder="Enter phone number"
                        value={value}
                        onChangeText={onChange}
                        errorMessage={error?.message}
                      />
                    )}
                  />
                </View>
              </View>
            </View>

            <View className="mb-4">
              <Controller
                name="nationality"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <ThemeTextInput
                    label="Nationality"
                    placeholder="Enter your nationality"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={error?.message}
                  />
                )}
              />
            </View>

            <View className="mb-4">
              <Controller
                name="dateOfBirth"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <>
                    <ThemeTextInput
                      label="Date of Birth"
                      placeholder="YYYY-MM-DD"
                      value={value}
                      onChangeText={onChange}
                      errorMessage={error?.message}
                    />
                    {!error && (
                      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Format: YYYY-MM-DD (e.g., 1990-01-15)
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            {/* Submit Button */}
            <View className="mt-8 mb-6">
              <ThemeButton
                variant="primary"
                onPress={handleSubmit(onSubmit)}
                disabled={hasErrors}
                loading={isLoading}
              >
                Continue
              </ThemeButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
