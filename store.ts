import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

const KYC_LINK_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// Custom secure storage adapter for Zustand
const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
      console.warn("Failed to store data in SecureStore");
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // Ignore removal errors
    }
  },
};

interface KycState {
  kycLink: string | null;
  tosLink: string | null;
  kycStatus: string | null;
  tosStatus: string | null;
  kycLinkCreatedAt: number | null;
  setKycData: (data: {
    kycLink: string;
    tosLink: string;
    kycStatus: string;
    tosStatus: string;
  }) => void;
  clearKycData: () => void;
  isKycLinkExpired: () => boolean;
}

export const useKycStore = create<KycState>()(
  persist(
    (set, get) => ({
      kycLink: null,
      tosLink: null,
      kycStatus: null,
      tosStatus: null,
      kycLinkCreatedAt: null,
      setKycData: (data) =>
        set({
          kycLink: data.kycLink,
          tosLink: data.tosLink,
          kycStatus: data.kycStatus,
          tosStatus: data.tosStatus,
          kycLinkCreatedAt: Date.now(),
        }),
      clearKycData: () =>
        set({
          kycLink: null,
          tosLink: null,
          kycStatus: null,
          tosStatus: null,
          kycLinkCreatedAt: null,
        }),
      isKycLinkExpired: () => {
        const { kycLinkCreatedAt } = get();
        if (!kycLinkCreatedAt) return true;
        return Date.now() - kycLinkCreatedAt > KYC_LINK_EXPIRY_MS;
      },
    }),
    {
      name: "kyc-storage",
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
