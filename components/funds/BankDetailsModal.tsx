import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { useState } from "react";
import { X, Copy, CheckCircle, Info, Share2 } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import ThemeButton from "@/components/ui/ThemeButton";

// Dummy bank details for receiving funds
const BANK_DETAILS = {
  accountHolderName: "DattaPay Inc.",
  bankName: "Lead Bank",
  routingNumber: "084106768",
  accountNumber: "9800012345",
  reference: "USER-12345",
};

interface BankDetailsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function BankDetailsModal({
  visible,
  onClose,
}: BankDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyField = async (field: string, value: string) => {
    await Clipboard.setStringAsync(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatAllDetails = () => {
    return `Account Holder Name: ${BANK_DETAILS.accountHolderName}
Bank Name: ${BANK_DETAILS.bankName}
Routing Number: ${BANK_DETAILS.routingNumber}
Account Number: ${BANK_DETAILS.accountNumber}
Reference/Memo (Required): ${BANK_DETAILS.reference}`;
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white dark:bg-[#121212]">
        {/* Modal Header */}
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
          {/* Detail Fields */}
          <View className="gap-4">
            {/* Account Holder Name */}
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                  Account Holder Name
                </Text>
                <Pressable
                  onPress={() =>
                    copyField("accountHolder", BANK_DETAILS.accountHolderName)
                  }
                >
                  {copiedField === "accountHolder" ? (
                    <CheckCircle size={18} color="#10B981" />
                  ) : (
                    <Copy size={18} color="#6B7280" />
                  )}
                </Pressable>
              </View>
              <Text className="text-gray-900 dark:text-white text-base font-medium">
                {BANK_DETAILS.accountHolderName}
              </Text>
            </View>

            {/* Bank Name */}
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                  Bank Name
                </Text>
                <Pressable
                  onPress={() => copyField("bankName", BANK_DETAILS.bankName)}
                >
                  {copiedField === "bankName" ? (
                    <CheckCircle size={18} color="#10B981" />
                  ) : (
                    <Copy size={18} color="#6B7280" />
                  )}
                </Pressable>
              </View>
              <Text className="text-gray-900 dark:text-white text-base font-medium">
                {BANK_DETAILS.bankName}
              </Text>
            </View>

            {/* Routing Number */}
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                  Routing Number
                </Text>
                <Pressable
                  onPress={() =>
                    copyField("routingNumber", BANK_DETAILS.routingNumber)
                  }
                >
                  {copiedField === "routingNumber" ? (
                    <CheckCircle size={18} color="#10B981" />
                  ) : (
                    <Copy size={18} color="#6B7280" />
                  )}
                </Pressable>
              </View>
              <Text className="text-gray-900 dark:text-white text-base font-medium font-mono">
                {BANK_DETAILS.routingNumber}
              </Text>
            </View>

            {/* Account Number */}
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                  Account Number
                </Text>
                <Pressable
                  onPress={() =>
                    copyField("accountNumber", BANK_DETAILS.accountNumber)
                  }
                >
                  {copiedField === "accountNumber" ? (
                    <CheckCircle size={18} color="#10B981" />
                  ) : (
                    <Copy size={18} color="#6B7280" />
                  )}
                </Pressable>
              </View>
              <Text className="text-gray-900 dark:text-white text-base font-medium font-mono">
                {BANK_DETAILS.accountNumber}
              </Text>
            </View>

            {/* Reference/Memo with Required Badge */}
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                    Reference/Memo
                  </Text>
                  <View className="bg-red-500 px-2 py-0.5 rounded ml-2">
                    <Text className="text-white text-xs font-medium">
                      Required
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() =>
                    copyField("reference", BANK_DETAILS.reference)
                  }
                >
                  {copiedField === "reference" ? (
                    <CheckCircle size={18} color="#10B981" />
                  ) : (
                    <Copy size={18} color="#6B7280" />
                  )}
                </Pressable>
              </View>
              <Text className="text-gray-900 dark:text-white text-base font-medium font-mono">
                {BANK_DETAILS.reference}
              </Text>
            </View>
          </View>

          {/* Info Note */}
          <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mt-5">
            <View className="flex-row items-start">
              <Info size={18} color="#3B82F6" />
              <Text className="text-blue-700 dark:text-blue-300 text-sm ml-2 flex-1">
                Funds arrive in USD and auto-convert to USDC.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mt-6 gap-3">
            <ThemeButton
              variant="primary"
              onPress={copyAllDetails}
              leftIcon={
                copiedField === "all" ? (
                  <CheckCircle size={18} color="white" />
                ) : (
                  <Copy size={18} color="white" />
                )
              }
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
        </ScrollView>
      </View>
    </Modal>
  );
}
