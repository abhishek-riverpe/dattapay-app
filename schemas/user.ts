import * as yup from "yup";

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
  phoneNumberPrefix: yup.string().required("Country code is required"),
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

export const addressSchema = yup.object({
  addressLine1: yup.string().required("Address line 1 is required"),
  addressLine2: yup.string().default(""),
  locality: yup.string().default(""),
  city: yup.string().required("City is required"),
  state: yup.string().required("State/Province is required"),
  country: yup.string().required("Country is required"),
  postalCode: yup.string().required("Postal code is required"),
  userId: yup.string().uuid().required(),
});

export type AddressFormData = yup.InferType<typeof addressSchema>;

export type Address = {
  id: string;
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
  id: string;
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

export type AccountStatus = "INITIAL" | "ACTIVE" | "PENDING" | "REJECTED";
