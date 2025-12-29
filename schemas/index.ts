import * as yup from "yup";

// =====================================
// Sign Up Schema
// =====================================
export const signUpSchema = yup.object({
  emailAddress: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type SignUpFormData = yup.InferType<typeof signUpSchema>;

// =====================================
// Sign In Schema
// =====================================
export const signInSchema = yup.object({
  emailAddress: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup.string().required("Password is required"),
});

export type SignInFormData = yup.InferType<typeof signInSchema>;

// =====================================
// Verification Code Schema
// =====================================
export const verificationCodeSchema = yup.object({
  code: yup
    .string()
    .required("Verification code is required")
    .length(6, "Code must be 6 digits"),
});

export type VerificationCodeFormData = yup.InferType<
  typeof verificationCodeSchema
>;

// =====================================
// Forgot Password Schemas
// =====================================
export const forgotPasswordEmailSchema = yup.object({
  emailAddress: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordEmailFormData = yup.InferType<
  typeof forgotPasswordEmailSchema
>;

export const resetPasswordSchema = yup.object({
  code: yup
    .string()
    .required("Reset code is required")
    .length(6, "Code must be 6 digits"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

// =====================================
// Personal Info Schema (Screen 1)
// =====================================
export const personalInfoSchema = yup.object({
  clerkUserId: yup.string().required(),
  firstName: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  phoneNumberPrefix: yup
    .string()
    .required("Country code is required")
    .matches(/^\d{1,4}$/, "Invalid country code"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^\d{6,15}$/, "Phone number must be 6-15 digits"),
  nationality: yup.string().required("Nationality is required"),
  dateOfBirth: yup
    .string()
    .required("Date of birth is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .test("valid-date", "Invalid date", (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !Number.isNaN(date.getTime());
    })
    .test("min-age", "You must be at least 18 years old", (value) => {
      if (!value) return false;
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age >= 18;
    }),
});

export type PersonalInfoFormData = yup.InferType<typeof personalInfoSchema>;

// =====================================
// Address Schema (Screen 2)
// =====================================
export const addressSchema = yup.object({
  addressLine1: yup.string().required("Address line 1 is required"),
  addressLine2: yup.string().default(""),
  locality: yup.string().default(""),
  city: yup.string().required("City is required"),
  state: yup.string().required("State/Province is required"),
  country: yup.string().required("Country is required"),
  postalCode: yup.string().required("Postal code is required"),
  userId: yup.number().required(),
});

export type AddressFormData = yup.InferType<typeof addressSchema>;

export type APIResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type Address = {
  id: number;
  addressLine1: string;
  addressLine2: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  created_at: Date;
  updated_at: Date;
};

export type User = {
  id: number;
  firstName: string;
  clerkUserId: string;
  zynkEntityId: string;
  zynkFundingAccountId: string;
  lastName: string;
  email: string;
  publicKey: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  accountStatus: string;
  nationality: string;
  dateOfBirth: Date;
  address: Address;
  created_at: Date;
  updated_at: Date;
};

// =====================================
// Wallet Types
// =====================================
export type WalletAccount = {
  id: number;
  walletId: number;
  address: string;
  curve: string;
  pathFormat: string;
  path: string;
  addressFormat: string;
  created_at: string;
  updated_at: string;
};

export type Wallet = {
  id: number;
  userId: number;
  zynkWalletId: string;
  walletName: string;
  chain: string;
  status: string;
  account: WalletAccount | null;
  created_at: string;
  updated_at: string;
};

export type PreparePayload = {
  payloadId: string;
  payloadToSign: string;
};

export type Transaction = {
  hash: string;
  type: string;
  status: string;
  timestamp: string;
  from: string;
  to: string;
  amount: string;
  tokenSymbol: string;
  fee: string;
};

export type WalletTransactions = {
  wallet: {
    id: number;
    walletName: string;
    address: string;
  };
  transactions: Transaction[];
  total: number;
};
