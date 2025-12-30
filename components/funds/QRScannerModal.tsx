import { View, Text, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import ThemeButton from "@/components/ui/ThemeButton";

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function QRScannerModal({
  visible,
  onClose,
  onScan,
}: QRScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();

  const handleScan = (data: string) => {
    onScan(data);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        <SafeAreaView className="flex-1">
          {/* Scanner Header */}
          <View className="flex-row items-center justify-between px-6 py-4">
            <Text className="text-white text-xl font-bold">Scan QR Code</Text>
            <Pressable
              onPress={onClose}
              className="p-2 rounded-full bg-white/20"
            >
              <X size={24} color="white" />
            </Pressable>
          </View>

          {/* Camera View */}
          <View className="flex-1 items-center justify-center">
            {permission?.granted ? (
              <CameraView
                style={{ width: "100%", height: "100%" }}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={(result) => {
                  if (result.data) {
                    handleScan(result.data);
                  }
                }}
              >
                {/* Scan Frame Overlay */}
                <View className="flex-1 items-center justify-center">
                  <View className="w-64 h-64 border-2 border-white rounded-2xl" />
                  <Text className="text-white text-center mt-4">
                    Point camera at QR code
                  </Text>
                </View>
              </CameraView>
            ) : (
              <View className="items-center px-6">
                <Text className="text-white text-center mb-4">
                  Camera permission is required to scan QR codes
                </Text>
                <ThemeButton
                  variant="secondary"
                  fullWidth={false}
                  onPress={requestPermission}
                >
                  Grant Permission
                </ThemeButton>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
