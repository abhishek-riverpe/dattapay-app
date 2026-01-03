// Account Service - Handles account completion API calls
import apiClient from "@/lib/api-client";

export interface AccountFormData {
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

export async function submitAccountDetails(data: AccountFormData): Promise<void> {
  try {
    const response = await apiClient.post("/api/users/complete-account", data);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || "Failed to submit account details");
    }
    throw error;
  }
}

export async function checkAccountStatus(clerkUserId: string): Promise<{
  accountCompleted: boolean;
  kycCompleted: boolean;
}> {
  try {
    const response = await apiClient.get(`/api/users/${clerkUserId}/status`);
    return response.data;
  } catch (error: unknown) {
    // If user doesn't exist or error, assume account not completed
    return {
      accountCompleted: false,
      kycCompleted: false,
    };
  }
}

export async function submitKYCDocuments(data: {
  clerkUserId: string;
  identityDocument?: string;
  selfie?: string;
  proofOfAddress?: string;
}): Promise<void> {
  try {
    const response = await apiClient.post("/api/users/kyc", data);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || "Failed to submit KYC documents");
    }
    throw error;
  }
}
