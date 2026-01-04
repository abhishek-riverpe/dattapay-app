import ThemeButton from "@/components/ui/ThemeButton";
import ThemeTextInput from "@/components/ui/ThemeTextInput";
import CountryPicker from "@/components/ui/CountryPicker";
import DatePicker from "@/components/ui/DatePicker";
import { Mail, Globe } from "lucide-react-native";
import SignOutButton from "@/components/SignOutButton";
import useCurrentUser from "@/hooks/useCurrentUser";
import apiClient from "@/lib/api-client";
import {
  generateAndStoreKeys,
  hasExistingKeys,
  getPublicKey,
} from "@/lib/key-generator";
import { PersonalInfoFormData, personalInfoSchema } from "@/schemas";
import { Country } from "@/constants/countries";
import { useUser } from "@clerk/clerk-expo";
import { yupResolver } from "@hookform/resolvers/yup";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompleteAccountScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { data: currentUserResponse } = useCurrentUser();
  const currentUser = currentUserResponse?.data;

  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState("");
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  React.useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    resolver: yupResolver(personalInfoSchema),
    mode: "onChange",
    defaultValues: {
      clerkUserId: user?.id || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.emailAddresses[0]?.emailAddress || "",
      phoneNumberPrefix: "",
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
    } else if (user) {
      reset({
        clerkUserId: user.id || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddresses[0]?.emailAddress || "",
        phoneNumberPrefix: "+91",
        phoneNumber: "",
        nationality: "",
        dateOfBirth: "",
      });
    }
  }, [currentUser, user, reset]);

  const getOrGeneratePublicKey = async (): Promise<string> => {
    const keysExist = await hasExistingKeys();
    if (keysExist) {
      return (await getPublicKey())!;
    }
    return generateAndStoreKeys();
  };

  const onSubmit = async (data: PersonalInfoFormData) => {
    setIsLoading(true);
    setServerError("");
    try {
      if (currentUser) {
        const { clerkUserId, ...updateData } = data;
        if (currentUser.publicKey) {
          await apiClient.put("/users/update-user", updateData);
        } else {
          const publicKey = await getOrGeneratePublicKey();
          await apiClient.put("/users/update-user", { ...updateData, publicKey });
        }
      } else {
        const publicKey = await getOrGeneratePublicKey();
        await apiClient.post("/users", { ...data, publicKey });
      }
      router.push("/(account)/complete-address");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof AxiosError && err.response
          ? err.response.data.message || "Something went wrong"
          : "Something went wrong";
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  const handleCountrySelect = (country: Country) => {
    setValue("phoneNumberPrefix", country.dialCode);
    setValue("nationality", country.code);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: keyboardHeight + 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6 pb-8">
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
          {/* Row 1: First Name & Last Name */}
          <View className="flex-row mb-4 gap-3">
            <View className="flex-1">
              <Controller
                name="firstName"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <ThemeTextInput
                    label="First Name"
                    placeholder="First name"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={error?.message}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                name="lastName"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <ThemeTextInput
                    label="Last Name"
                    placeholder="Last name"
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
                  leftIcon={Mail}
                  disabled
                />
              )}
            />
          </View>

          {/* Row 2: Country Picker & Phone Number */}
          <View className="flex-row mb-4 gap-3">
            <View className="w-28">
              <Controller
                name="phoneNumberPrefix"
                control={control}
                render={({ field: { value }, fieldState: { error } }) => (
                  <CountryPicker
                    label="Code"
                    value={value}
                    onSelect={handleCountrySelect}
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
                    label="Phone Number"
                    placeholder="Phone number"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={error?.message}
                  />
                )}
              />
            </View>
          </View>

          {/* Row 3: Nationality & Date of Birth */}
          <View className="mb-4 gap-4">
            <View className="flex-1">
              <Controller
                name="nationality"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <ThemeTextInput
                    label="Nationality"
                    placeholder="Select"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={error?.message}
                    leftIcon={Globe}
                    disabled
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                name="dateOfBirth"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <DatePicker
                    label="Date of Birth"
                    placeholder="mm/dd/yyyy"
                    value={value}
                    onChange={onChange}
                    errorMessage={error?.message}
                    maximumDate={new Date()}
                  />
                )}
              />
            </View>
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

            {currentUser && (
              <>
                <ThemeButton
                  variant="ghost"
                  onPress={() => router.push("/(account)/complete-address")}
                  className="mt-3"
                >
                  Skip for now
                </ThemeButton>
                <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  You can complete this later from your account settings
                </Text>
              </>
            )}

            {!currentUser && (
              <View className="mt-4">
                <SignOutButton />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
