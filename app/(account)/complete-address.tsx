import ThemeButton from "@/components/ui/ThemeButton";
import ThemeTextInput from "@/components/ui/ThemeTextInput";
import { useTheme } from "@/context/ThemeContext";
import useCurrentUser from "@/hooks/useCurrentUser";
import apiClient from "@/lib/api-client";
import { AddressFormData, addressSchema } from "@/schemas";
import { yupResolver } from "@hookform/resolvers/yup";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompleteAddressScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { data: currentUserResponse } = useCurrentUser();
  const currentUser = currentUserResponse?.data;

  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addressSchema.omit(["userId"])),
    mode: "onChange",
    defaultValues: {
      addressLine1: "",
      addressLine2: "",
      locality: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  React.useEffect(() => {
    if (currentUser?.address) {
      reset({
        addressLine1: currentUser.address.addressLine1,
        addressLine2: currentUser.address.addressLine2 || "",
        locality: currentUser.address.locality || "",
        city: currentUser.address.city,
        state: currentUser.address.state,
        country: currentUser.address.country,
        postalCode: currentUser.address.postalCode,
      });
    }
  }, [currentUser, reset]);

  const onSubmit = async (data: Omit<AddressFormData, "userId">) => {
    setIsLoading(true);
    setServerError("");

    try {
      if (currentUser?.address) {
        await apiClient.put("/addresses", data);
      } else {
        await apiClient.post("/addresses", data);
      }
      router.replace("/(account)/active-account");
    } catch (err: any) {
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
            {/* Back Button */}
            <Pressable
              onPress={() => router.push("/(account)/complete-account")}
              className="flex-row items-center mb-4"
            >
              <ChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
              <Text className="text-base text-gray-600 dark:text-gray-300 ml-1">
                Back
              </Text>
            </Pressable>

            {/* Header */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Permanent Address
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Please provide your residential address
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
                name="addressLine1"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <ThemeTextInput
                    label="Address Line 1"
                    placeholder="Street address"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={error?.message}
                  />
                )}
              />
            </View>

            <View className="mb-4">
              <Controller
                name="addressLine2"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <ThemeTextInput
                    label="Address Line 2 (Optional)"
                    placeholder="Apt, Suite, Unit, etc."
                    value={value || ""}
                    onChangeText={onChange}
                    errorMessage={error?.message}
                  />
                )}
              />
            </View>

            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Controller
                  name="locality"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <ThemeTextInput
                      label="Locality"
                      placeholder="Locality"
                      value={value || ""}
                      onChangeText={onChange}
                      errorMessage={error?.message}
                    />
                  )}
                />
              </View>
              <View className="flex-1 ml-2">
                <Controller
                  name="city"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <ThemeTextInput
                      label="City"
                      placeholder="City"
                      value={value}
                      onChangeText={onChange}
                      errorMessage={error?.message}
                    />
                  )}
                />
              </View>
            </View>

            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Controller
                  name="state"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <ThemeTextInput
                      label="State/Province"
                      placeholder="State"
                      value={value}
                      onChangeText={onChange}
                      errorMessage={error?.message}
                    />
                  )}
                />
              </View>
              <View className="flex-1 ml-2">
                <Controller
                  name="postalCode"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <ThemeTextInput
                      label="Postal Code"
                      placeholder="Postal code"
                      value={value}
                      onChangeText={onChange}
                      errorMessage={error?.message}
                    />
                  )}
                />
              </View>
            </View>

            <View className="mb-4">
              <Controller
                name="country"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <ThemeTextInput
                    label="Country"
                    placeholder="Country"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={error?.message}
                  />
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
                Submit & Continue to KYC
              </ThemeButton>

              <ThemeButton
                variant="ghost"
                onPress={() => router.push("/(account)/active-account")}
                className="mt-3"
              >
                Skip for now
              </ThemeButton>
              <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                You can complete this later from your account settings
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
