import CryptoJS from "crypto-js";

const base64UrlEncode = (wordArray: CryptoJS.lib.WordArray): string => {
  return wordArray
    .toString(CryptoJS.enc.Base64)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/={1,2}$/, "");
};

const base64UrlEncodeString = (str: string): string => {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/={1,2}$/g, "");
};

export const generateAdminToken = (secret: string): string => {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { iat: Math.floor(Date.now() / 1000) };

  const encodedHeader = base64UrlEncodeString(JSON.stringify(header));
  const encodedPayload = base64UrlEncodeString(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = CryptoJS.HmacSHA256(signatureInput, secret);
  const encodedSignature = base64UrlEncode(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
};

let cachedToken: string | null = null;

export const getOrCreateAdminToken = (): string | null => {
  const secret = process.env.EXPO_PUBLIC_ADMIN_TOKEN_SECRET;
  if (!secret) {
    console.warn("EXPO_PUBLIC_ADMIN_TOKEN_SECRET is not configured");
    return null;
  }
  if (!cachedToken) {
    cachedToken = generateAdminToken(secret);
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
