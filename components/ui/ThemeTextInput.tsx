import { TextInput, View, Text, Pressable } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";

type InputVariant = "default" | "email" | "password" | "code";

interface ThemeTextInputProps {
  variant?: InputVariant;
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  className?: string;
}

const variantConfig: Record<
  InputVariant,
  {
    keyboardType?: "default" | "email-address" | "number-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoComplete?: "email" | "password" | "off";
    secureTextEntry?: boolean;
    textAlign?: "left" | "center";
    additionalStyles?: string;
  }
> = {
  default: {
    keyboardType: "default",
    autoCapitalize: "sentences",
    autoComplete: "off",
    secureTextEntry: false,
    textAlign: "left",
  },
  email: {
    keyboardType: "email-address",
    autoCapitalize: "none",
    autoComplete: "email",
    secureTextEntry: false,
    textAlign: "left",
  },
  password: {
    keyboardType: "default",
    autoCapitalize: "none",
    autoComplete: "password",
    secureTextEntry: true,
    textAlign: "left",
  },
  code: {
    keyboardType: "number-pad",
    autoCapitalize: "none",
    autoComplete: "off",
    secureTextEntry: false,
    textAlign: "center",
    additionalStyles: "tracking-widest",
  },
};

export default function ThemeTextInput({
  variant = "default",
  label,
  placeholder,
  value,
  onChangeText,
  maxLength,
  disabled = false,
  error = false,
  errorMessage,
  className = "",
}: ThemeTextInputProps) {
  const { isDark } = useTheme();
  const config = variantConfig[variant];
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = variant === "password";

  const placeholderColor = isDark ? "#6B7280" : "#9CA3AF";

  // Derive error state from either prop
  const hasError = error || !!errorMessage;

  const baseStyles =
    "w-full h-14 px-4 bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-white text-base";

  const borderStyles = hasError
    ? "border-red-500 dark:border-red-500"
    : "border-gray-200 dark:border-gray-700";

  const disabledStyles = disabled ? "opacity-50" : "";

  const inputClasses = [
    baseStyles,
    borderStyles,
    disabledStyles,
    config.additionalStyles,
    config.textAlign === "center" && "text-center",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <View>
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </Text>
      )}
      <View className="relative">
        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          onChangeText={onChangeText}
          keyboardType={config.keyboardType}
          autoCapitalize={config.autoCapitalize}
          autoComplete={config.autoComplete}
          secureTextEntry={isPasswordField ? !showPassword : config.secureTextEntry}
          maxLength={maxLength ?? (variant === "code" ? 6 : undefined)}
          editable={!disabled}
          className={`${inputClasses} ${isPasswordField ? "pr-12" : ""}`}
          accessibilityLabel={label}
        />
        {isPasswordField && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-0 bottom-0 justify-center"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
            ) : (
              <Eye size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
            )}
          </Pressable>
        )}
      </View>
      {errorMessage && (
        <Text className="text-xs text-red-500 dark:text-red-400 mt-1">
          {errorMessage}
        </Text>
      )}
    </View>
  );
}
