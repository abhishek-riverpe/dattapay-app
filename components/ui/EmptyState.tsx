import { View, Text } from "react-native";
import IconCircle from "@/components/ui/IconCircle";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  iconSize?: "lg" | "xl";
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  iconSize = "lg",
  action,
  className = "",
}: EmptyStateProps) {
  const iconMargin = iconSize === "xl" ? "mb-6" : "mb-4";
  const titleSize = iconSize === "xl" ? "text-2xl" : "text-base";

  return (
    <View className={`items-center ${className}`}>
      <IconCircle icon={icon} size={iconSize} color="gray" className={iconMargin} />
      <Text
        className={`${titleSize} font-semibold text-gray-900 dark:text-white mb-2 text-center`}
      >
        {title}
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {description}
      </Text>
      {action && <View className="mt-6">{action}</View>}
    </View>
  );
}
