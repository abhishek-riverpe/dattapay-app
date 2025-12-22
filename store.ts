import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface KycState {
  kycLink: string | null;
  tosLink: string | null;
  kycStatus: string | null;
  tosStatus: string | null;
  setKycData: (data: {
    kycLink: string;
    tosLink: string;
    kycStatus: string;
    tosStatus: string;
  }) => void;
  clearKycData: () => void;
}

export const useKycStore = create<KycState>()(
  persist(
    (set) => ({
      kycLink: null,
      tosLink: null,
      kycStatus: null,
      tosStatus: null,
      setKycData: (data) =>
        set({
          kycLink: data.kycLink,
          tosLink: data.tosLink,
          kycStatus: data.kycStatus,
          tosStatus: data.tosStatus,
        }),
      clearKycData: () =>
        set({
          kycLink: null,
          tosLink: null,
          kycStatus: null,
          tosStatus: null,
        }),
    }),
    {
      name: "kyc-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
