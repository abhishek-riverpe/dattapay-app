import * as React from "react";
import {
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import ThemeButton from "@/components/ui/ThemeButton";
import ThemeTextInput from "@/components/ui/ThemeTextInput";
import { useTheme } from "@/context/ThemeContext";
import { submitAccountDetails } from "@/services/accountService";

interface AccountFormData {
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  nationality: string;
  dateOfBirth: string;
  permanentAddress: {
    addressLine1: string;
    addressLine2: string;
    locality: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

const TOTAL_STEPS = 3;

export default function CompleteAccountScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { isDark } = useTheme();

  const [currentStep, setCurrentStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [formData, setFormData] = React.useState<AccountFormData>({
    clerkUserId: user?.id || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.emailAddresses[0]?.emailAddress || "",
    phoneNumberPrefix: "+1",
    phoneNumber: "",
    nationality: "",
    dateOfBirth: "",
    permanentAddress: {
      addressLine1: "",
      addressLine2: "",
      locality: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateAddressField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      permanentAddress: {
        ...prev.permanentAddress,
        [field]: value,
      },
    }));
  };

  const canProceedStep1 = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== ""
    );
  };

  const canProceedStep2 = () => {
    return (
      formData.phoneNumber.trim() !== "" &&
      formData.nationality.trim() !== "" &&
      formData.dateOfBirth.trim() !== ""
    );
  };

  const canProceedStep3 = () => {
    const addr = formData.permanentAddress;
    return (
      addr.addressLine1.trim() !== "" &&
      addr.city.trim() !== "" &&
      addr.state.trim() !== "" &&
      addr.country.trim() !== "" &&
      addr.postalCode.trim() !== ""
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return canProceedStep1();
      case 2:
        return canProceedStep2();
      case 3:
        return canProceedStep3();
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      setError("");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setError("");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      await submitAccountDetails(formData);
      router.replace("/(account)/complete-kyc");
    } catch (err: any) {
      setError(err.message || "Failed to submit account details");
      console.error("Account submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <View key={step} className="flex-row items-center">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              step === currentStep
                ? "bg-primary"
                : step < currentStep
                ? "bg-green-500"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                step <= currentStep ? "text-white" : "text-gray-500"
              }`}
            >
              {step}
            </Text>
          </View>
          {step < TOTAL_STEPS && (
            <View
              className={`w-12 h-1 mx-1 ${
                step < currentStep
                  ? "bg-green-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Personal Information
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Let's start with your basic details
      </Text>

      <View className="mb-4">
        <ThemeTextInput
          label="First Name"
          placeholder="Enter your first name"
          value={formData.firstName}
          onChangeText={(text) => updateFormData("firstName", text)}
        />
      </View>

      <View className="mb-4">
        <ThemeTextInput
          label="Last Name"
          placeholder="Enter your last name"
          value={formData.lastName}
          onChangeText={(text) => updateFormData("lastName", text)}
        />
      </View>

      <View className="mb-4">
        <ThemeTextInput
          variant="email"
          label="Email Address"
          placeholder="Enter your email"
          value={formData.email}
          onChangeText={(text) => updateFormData("email", text)}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Contact & Identity
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        We need a few more details to verify your identity
      </Text>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Phone Number
        </Text>
        <View className="flex-row">
          <View className="w-24 mr-2">
            <ThemeTextInput
              placeholder="+1"
              value={formData.phoneNumberPrefix}
              onChangeText={(text) => updateFormData("phoneNumberPrefix", text)}
            />
          </View>
          <View className="flex-1">
            <ThemeTextInput
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChangeText={(text) => updateFormData("phoneNumber", text)}
            />
          </View>
        </View>
      </View>

      <View className="mb-4">
        <ThemeTextInput
          label="Nationality"
          placeholder="Enter your nationality"
          value={formData.nationality}
          onChangeText={(text) => updateFormData("nationality", text)}
        />
      </View>

      <View className="mb-4">
        <ThemeTextInput
          label="Date of Birth"
          placeholder="YYYY-MM-DD"
          value={formData.dateOfBirth}
          onChangeText={(text) => updateFormData("dateOfBirth", text)}
        />
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Format: YYYY-MM-DD (e.g., 1990-01-15)
        </Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Permanent Address
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Please provide your residential address
      </Text>

      <View className="mb-4">
        <ThemeTextInput
          label="Address Line 1"
          placeholder="Street address"
          value={formData.permanentAddress.addressLine1}
          onChangeText={(text) => updateAddressField("addressLine1", text)}
        />
      </View>

      <View className="mb-4">
        <ThemeTextInput
          label="Address Line 2 (Optional)"
          placeholder="Apt, Suite, Unit, etc."
          value={formData.permanentAddress.addressLine2}
          onChangeText={(text) => updateAddressField("addressLine2", text)}
        />
      </View>

      <View className="flex-row mb-4">
        <View className="flex-1 mr-2">
          <ThemeTextInput
            label="Locality"
            placeholder="Locality"
            value={formData.permanentAddress.locality}
            onChangeText={(text) => updateAddressField("locality", text)}
          />
        </View>
        <View className="flex-1 ml-2">
          <ThemeTextInput
            label="City"
            placeholder="City"
            value={formData.permanentAddress.city}
            onChangeText={(text) => updateAddressField("city", text)}
          />
        </View>
      </View>

      <View className="flex-row mb-4">
        <View className="flex-1 mr-2">
          <ThemeTextInput
            label="State/Province"
            placeholder="State"
            value={formData.permanentAddress.state}
            onChangeText={(text) => updateAddressField("state", text)}
          />
        </View>
        <View className="flex-1 ml-2">
          <ThemeTextInput
            label="Postal Code"
            placeholder="Postal code"
            value={formData.permanentAddress.postalCode}
            onChangeText={(text) => updateAddressField("postalCode", text)}
          />
        </View>
      </View>

      <View className="mb-4">
        <ThemeTextInput
          label="Country"
          placeholder="Country"
          value={formData.permanentAddress.country}
          onChangeText={(text) => updateAddressField("country", text)}
        />
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

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
                Complete Your Account
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Step {currentStep} of {TOTAL_STEPS}
              </Text>
            </View>

            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Error Message */}
            {error ? (
              <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <Text className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Current Step Content */}
            {renderCurrentStep()}

            {/* Navigation Buttons */}
            <View className="flex-row mt-8 mb-6">
              {currentStep > 1 && (
                <TouchableOpacity
                  onPress={handleBack}
                  className="flex-row items-center justify-center h-14 px-6 rounded-xl bg-gray-100 dark:bg-gray-800 mr-3"
                >
                  <ChevronLeft
                    size={20}
                    color={isDark ? "#FFFFFF" : "#374151"}
                  />
                  <Text className="text-gray-900 dark:text-white font-semibold ml-1">
                    Back
                  </Text>
                </TouchableOpacity>
              )}

              <View className="flex-1">
                {currentStep < TOTAL_STEPS ? (
                  <ThemeButton
                    variant="primary"
                    onPress={handleNext}
                    disabled={!canProceed()}
                    rightIcon={<ChevronRight size={20} color="#FFFFFF" />}
                  >
                    Continue
                  </ThemeButton>
                ) : (
                  <ThemeButton
                    variant="primary"
                    onPress={handleSubmit}
                    disabled={!canProceed()}
                    loading={isLoading}
                  >
                    Submit & Continue to KYC
                  </ThemeButton>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
