import ThemeButton from "@/components/ui/ThemeButton";
import ThemeTextInput from "@/components/ui/ThemeTextInput";
import CountryPicker from "@/components/ui/CountryPicker";
import DatePicker from "@/components/ui/DatePicker";
import FormErrorMessage from "@/components/ui/FormErrorMessage";
import { Mail } from "lucide-react-native";
import SignOutButton from "@/components/SignOutButton";
import useAccount from "@/hooks/useAccount";
import { useUser } from "@clerk/clerk-expo";
import useKeyboardHeight from "@/hooks/useKeyboardHeight";
import apiClient from "@/lib/api-client";
import {
  generateAndStoreKeys,
  hasExistingKeys,
  getPublicKey,
} from "@/lib/key-generator";
import { PersonalInfoFormData, personalInfoSchema } from "@/schemas";
import { Country } from "@/constants/countries";
import { yupResolver } from "@hookform/resolvers/yup";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompleteAccountScreen() {
  const router = useRouter();
  const keyboardHeight = useKeyboardHeight();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState("");
  const { user: clerkUser } = useUser();
  const { data: account } = useAccount();
  const user = account?.data.user;

  console.log("Current user:", user);

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
      clerkUserId: clerkUser?.id || "",
      firstName: clerkUser?.firstName || "",
      lastName: clerkUser?.lastName || "",
      email: clerkUser?.emailAddresses[0]?.emailAddress || "",
      phoneNumberPrefix: "+91",
      phoneNumber: "",
      nationality: "IN",
      dateOfBirth: "",
    },
  });

  React.useEffect(() => {
    if (user) {
      const dateOfBirth =
        user.dateOfBirth instanceof Date
          ? user.dateOfBirth.toISOString().split("T")[0]
          : String(user.dateOfBirth).split("T")[0];
      reset({
        clerkUserId: clerkUser?.id || "",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumberPrefix: user.phoneNumberPrefix,
        phoneNumber: user.phoneNumber,
        nationality: user.nationality,
        dateOfBirth: dateOfBirth,
      });
    } else if (clerkUser) {
      reset({
        clerkUserId: clerkUser.id,
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        phoneNumberPrefix: "+91",
        phoneNumber: "",
        nationality: "IN",
        dateOfBirth: "",
      });
    }
  }, [clerkUser, user, reset]);

  const getOrGeneratePublicKey = async (): Promise<string> => {
    const keysExist = await hasExistingKeys();
    if (keysExist) {
      const publicKey = await getPublicKey();
      if (publicKey) return publicKey;
    }
    return generateAndStoreKeys();
  };

  const onSubmit = async (data: PersonalInfoFormData) => {
    setIsLoading(true);
    setServerError("");
    try {
      if (user) {
        const { clerkUserId, ...updateData } = data;
        if (user.publicKey) {
          await apiClient.put("/users/update-user", updateData);
        } else {
          const publicKey = await getOrGeneratePublicKey();
          await apiClient.put("/users/update-user", {
            ...updateData,
            publicKey,
          });
        }
      } else {
        const publicKey = await getOrGeneratePublicKey();
        await apiClient.post("/users", { ...data, publicKey });
      }
      router.push("/(account)/complete-address");
    } catch (err: unknown) {
      console.error(err);
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
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: keyboardHeight + 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6 pb-8">
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Personal Information
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-400">
              Let's start with your basic details
            </Text>
          </View>
          <FormErrorMessage message={serverError} />
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
          <View className="mb-4 gap-4">
            <View className="flex-1">
              <Controller
                name="nationality"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <CountryPicker
                    label="Nationality"
                    value={value}
                    onSelect={(country) => onChange(country.code)}
                    errorMessage={error?.message}
                    displayField="name"
                    valueField="code"
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
          <View className="mt-8 mb-6">
            <ThemeButton
              variant="primary"
              onPress={handleSubmit(onSubmit)}
              disabled={hasErrors}
              loading={isLoading}
            >
              {user ? "Update and Continue" : "Continue"}
            </ThemeButton>

            {user && (
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

            {!user && (
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
