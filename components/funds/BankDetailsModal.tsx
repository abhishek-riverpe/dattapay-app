import { View, Text, Pressable, Modal, ScrollView, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { X, Copy, CheckCircle, Info, Share2, AlertCircle } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import ThemeButton from "@/components/ui/ThemeButton";
import apiClient from "@/lib/api-client";

interface BankDetails {
  accountHolderName: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  reference: string;
}

interface BankDetailsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface DetailFieldProps {
  label: string;
  value: string;
  fieldKey: string;
  copiedField: string | null;
  onCopy: (field: string, value: string) => void;
  isMonospace?: boolean;
  showRequired?: boolean;
}

function DetailField({ label, value, fieldKey, copiedField, onCopy, isMonospace, showRequired }: Readonly<DetailFieldProps>) {
  const isCopied = copiedField === fieldKey;
  const textStyle = isMonospace
    ? "text-gray-900 dark:text-white text-base font-medium font-mono"
    : "text-gray-900 dark:text-white text-base font-medium";

  return (
    <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
            {label}
          </Text>
          {showRequired && (
            <View className="bg-red-500 px-2 py-0.5 rounded ml-2">
              <Text className="text-white text-xs font-medium">Required</Text>
            </View>
          )}
        </View>
        <Pressable onPress={() => onCopy(fieldKey, value)}>
          {isCopied ? (
            <CheckCircle size={18} color="#10B981" />
          ) : (
            <Copy size={18} color="#6B7280" />
          )}
        </Pressable>
      </View>
      <Text className={textStyle}>{value}</Text>
    </View>
  );
}

export default function BankDetailsModal({
  visible,
  onClose,
}: Readonly<BankDetailsModalProps>) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && !bankDetails) {
      fetchBankDetails();
    }
  }, [visible]);

  const fetchBankDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/api/bank-details");
      setBankDetails(response.data.data);
    } catch {
      setError("Failed to load bank details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyField = async (field: string, value: string) => {
    await Clipboard.setStringAsync(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatAllDetails = () => {
    if (!bankDetails) return "";
    return `Account Holder Name: ${bankDetails.accountHolderName}
Bank Name: ${bankDetails.bankName}
Routing Number: ${bankDetails.routingNumber}
Account Number: ${bankDetails.accountNumber}
Reference/Memo (Required): ${bankDetails.reference}`;
  };

  const copyAllDetails = async () => {
    await Clipboard.setStringAsync(formatAllDetails());
    setCopiedField("all");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const shareDetails = async () => {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      const details = formatAllDetails();
      await Clipboard.setStringAsync(details);
      setCopiedField("shared");
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const getCopyAllIcon = () => {
    const color = "white";
    return copiedField === "all"
      ? <CheckCircle size={18} color={color} />
      : <Copy size={18} color={color} />;
  };

  const renderLoading = () => (
    <View className="items-center justify-center py-12">
      <ActivityIndicator size="large" color="#005AEE" />
      <Text className="text-gray-500 dark:text-gray-400 mt-4">
        Loading bank details...
      </Text>
    </View>
  );

  const renderError = () => (
    <View className="items-center justify-center py-12">
      <AlertCircle size={48} color="#EF4444" />
      <Text className="text-red-500 dark:text-red-400 mt-4 text-center">
        {error}
      </Text>
      <ThemeButton
        variant="secondary"
        onPress={fetchBankDetails}
        className="mt-4"
      >
        Retry
      </ThemeButton>
    </View>
  );

  const renderDetails = () => {
    if (!bankDetails) return null;
    return (
      <>
        <View className="gap-4">
          <DetailField
            label="Account Holder Name"
            value={bankDetails.accountHolderName}
            fieldKey="accountHolder"
            copiedField={copiedField}
            onCopy={copyField}
          />
          <DetailField
            label="Bank Name"
            value={bankDetails.bankName}
            fieldKey="bankName"
            copiedField={copiedField}
            onCopy={copyField}
          />
          <DetailField
            label="Routing Number"
            value={bankDetails.routingNumber}
            fieldKey="routingNumber"
            copiedField={copiedField}
            onCopy={copyField}
            isMonospace
          />
          <DetailField
            label="Account Number"
            value={bankDetails.accountNumber}
            fieldKey="accountNumber"
            copiedField={copiedField}
            onCopy={copyField}
            isMonospace
          />
          <DetailField
            label="Reference/Memo"
            value={bankDetails.reference}
            fieldKey="reference"
            copiedField={copiedField}
            onCopy={copyField}
            isMonospace
            showRequired
          />
        </View>

        <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mt-5">
          <View className="flex-row items-start">
            <Info size={18} color="#3B82F6" />
            <Text className="text-blue-700 dark:text-blue-300 text-sm ml-2 flex-1">
              Funds arrive in USD and auto-convert to USDC.
            </Text>
          </View>
        </View>

        <View className="mt-6 gap-3">
          <ThemeButton
            variant="primary"
            onPress={copyAllDetails}
            leftIcon={getCopyAllIcon()}
          >
            {copiedField === "all" ? "Copied!" : "Copy All Details"}
          </ThemeButton>

          <ThemeButton
            variant="secondary"
            onPress={shareDetails}
            leftIcon={<Share2 size={18} color="#374151" />}
          >
            {copiedField === "shared" ? "Copied to Share!" : "Share"}
          </ThemeButton>
        </View>
      </>
    );
  };

  const renderContent = () => {
    if (isLoading) return renderLoading();
    if (error) return renderError();
    if (bankDetails) return renderDetails();
    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white dark:bg-[#121212]">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Bank Account Details
          </Text>
          <Pressable
            onPress={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <X size={20} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-6 py-5">
          {renderContent()}
        </ScrollView>
      </View>
    </Modal>
  );
}
