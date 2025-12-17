import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "destructive"
  | "ghost"
  | "link"
  | "apple";

type ButtonSize = "sm" | "md" | "lg";

interface ThemeButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onPress: () => void;
  className?: string;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> =
  {
    primary: {
      container: "bg-primary",
      text: "text-white",
    },
    secondary: {
      container: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-900 dark:text-white",
    },
    destructive: {
      container:
        "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",
      text: "text-red-600 dark:text-red-400",
    },
    ghost: {
      container: "",
      text: "text-primary",
    },
    link: {
      container: "",
      text: "text-primary",
    },
    apple: {
      container: "bg-black dark:bg-white",
      text: "text-white dark:text-black",
    },
  };

const disabledStyles: Record<ButtonVariant, { container: string }> = {
  primary: { container: "bg-primary-300" },
  secondary: { container: "bg-gray-100 dark:bg-gray-800 opacity-50" },
  destructive: { container: "opacity-50" },
  ghost: { container: "opacity-50" },
  link: { container: "opacity-50" },
  apple: { container: "opacity-50" },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: "h-10", text: "text-sm" },
  md: { container: "h-12", text: "text-sm" },
  lg: { container: "h-14", text: "text-base" },
};

export default function ThemeButton({
  variant = "primary",
  size = "lg",
  fullWidth = true,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  onPress,
  className = "",
}: ThemeButtonProps) {
  const isDisabled = disabled || loading;
  const styles = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const isGhostOrLink = variant === "ghost" || variant === "link";

  const containerClasses = [
    !isGhostOrLink && "rounded-xl items-center justify-center",
    isGhostOrLink && "items-center justify-center",
    fullWidth && !isGhostOrLink && "w-full",
    !fullWidth && !isGhostOrLink && "px-8",
    variant !== "link" && sizeStyle.container,
    isDisabled ? disabledStyles[variant].container : styles.container,
    (leftIcon || rightIcon) && "flex-row",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const textClasses = [
    styles.text,
    sizeStyle.text,
    "font-semibold",
    variant === "link" && "font-semibold",
    variant === "ghost" && "font-medium",
  ]
    .filter(Boolean)
    .join(" ");

  const loadingColor =
    variant === "primary" || variant === "apple" ? "#FFFFFF" : "#005AEE";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={containerClasses}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator color={loadingColor} size="small" />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={textClasses}>{children}</Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
