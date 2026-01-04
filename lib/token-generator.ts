import CryptoJS from "crypto-js";

const base64UrlEncode = (wordArray: CryptoJS.lib.WordArray): string => {
  return wordArray
    .toString(CryptoJS.enc.Base64)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/={1,2}$/, "");
};

const base64UrlEncodeString = (str: string): string => {
  return btoa(str).replaceAll("+", "-").replaceAll("/", "_").replace(/={1,2}$/, "");
};

// Token expires in 1 hour
const TOKEN_EXPIRY_SECONDS = 60 * 60;

export const generateAdminToken = (secret: string): string => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    iat: now,
    exp: now + TOKEN_EXPIRY_SECONDS,
  };

  const encodedHeader = base64UrlEncodeString(JSON.stringify(header));
  const encodedPayload = base64UrlEncodeString(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = CryptoJS.HmacSHA256(signatureInput, secret);
  const encodedSignature = base64UrlEncode(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
};

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

const isTokenExpired = (): boolean => {
  // Refresh 5 minutes before actual expiry
  return Date.now() / 1000 >= tokenExpiry - 300;
};

export const getOrCreateAdminToken = (): string | null => {
  const secret = process.env.EXPO_PUBLIC_ADMIN_TOKEN_SECRET;
  if (!secret) {
    console.warn("EXPO_PUBLIC_ADMIN_TOKEN_SECRET is not configured");
    return null;
  }
  if (!cachedToken || isTokenExpired()) {
    cachedToken = generateAdminToken(secret);
    tokenExpiry = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS;
  }
  return cachedToken;
};

export const refreshAdminToken = (): string | null => {
  cachedToken = null;
  return getOrCreateAdminToken();
};

export const clearAdminToken = (): void => {
  cachedToken = null;
};
