// Account Service - Handles account completion API calls

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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.dattapay.com";

export async function submitAccountDetails(data: AccountFormData): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/complete-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Submit account details error:", error);
    throw error;
  }
}

export async function checkAccountStatus(clerkUserId: string): Promise<{
  accountCompleted: boolean;
  kycCompleted: boolean;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${clerkUserId}/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // If user doesn't exist or error, assume account not completed
      return {
        accountCompleted: false,
        kycCompleted: false,
      };
    }

    return await response.json();
  } catch (error: any) {
    console.error("Check account status error:", error);
    // Default to not completed on error
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
    const response = await fetch(`${API_BASE_URL}/api/users/kyc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Submit KYC documents error:", error);
    throw error;
  }
}
