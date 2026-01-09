import * as yup from "yup";

const passwordSchema = yup
  .string()
  .required("Password is required")
  .min(12, "Password must be at least 12 characters")
  .matches(/[a-z]/, "Password must contain at least one lowercase letter")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  .matches(/\d/, "Password must contain at least one number")
  .matches(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character"
  );

const emailSchema = yup
  .string()
  .required("Email is required")
  .email("Please enter a valid email address");

export const signUpSchema = yup.object({
  emailAddress: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

export type SignUpFormData = yup.InferType<typeof signUpSchema>;

export const signInSchema = yup.object({
  emailAddress: emailSchema,
  password: yup.string().required("Password is required"),
});

export type SignInFormData = yup.InferType<typeof signInSchema>;

export const verificationCodeSchema = yup.object({
  code: yup
    .string()
    .required("Verification code is required")
    .length(6, "Code must be 6 digits"),
});

export type VerificationCodeFormData = yup.InferType<
  typeof verificationCodeSchema
>;

export const forgotPasswordEmailSchema = yup.object({
  emailAddress: emailSchema,
});

export type ForgotPasswordEmailFormData = yup.InferType<
  typeof forgotPasswordEmailSchema
>;

export const resetPasswordSchema = yup.object({
  code: yup
    .string()
    .required("Reset code is required")
    .length(6, "Code must be 6 digits"),
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;
