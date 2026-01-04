import axios from "axios";
import { randomUUID } from "expo-crypto";
import { getClerkInstance } from "@clerk/clerk-expo";
import { getOrCreateAdminToken } from "./token-generator";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Validate that we're connecting to the expected host
function validateHost(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const allowedHosts = ["api.dattapay.com", "localhost", "127.0.0.1"];

    // In development, allow any host but warn if non-standard
    if (__DEV__) {
      if (!allowedHosts.includes(parsedUrl.hostname)) {
        console.warn(
          `[API] Connecting to non-standard host: ${parsedUrl.hostname}`
        );
      }
      return true;
    }

    return allowedHosts.includes(parsedUrl.hostname);
  } catch {
    return false;
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(async (config) => {
  // Validate the host before making requests (additional security layer)
  const fullUrl = `${config.baseURL || ""}${config.url || ""}`;
  if (!validateHost(fullUrl)) {
    throw new Error("Invalid API host");
  }

  try {
    const clerk = getClerkInstance();
    const authToken = await clerk.session?.getToken();
    const adminToken = getOrCreateAdminToken();
    const idempotencyKey = randomUUID();
    if (adminToken) {
      config.headers["x-api-token"] = adminToken;
    }
    if (idempotencyKey) {
      config.headers["idempotency-Key"] = idempotencyKey;
    }
    if (authToken) {
      config.headers["x-auth-token"] = authToken;
    }
  } catch (error) {
    // Log token errors in development for debugging
    if (__DEV__) {
      console.warn(
        "[API] Token error:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle SSL/certificate errors
    if (
      error.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
      error.code === "CERT_HAS_EXPIRED" ||
      error.code === "ERR_TLS_CERT_ALTNAME_INVALID"
    ) {
      // Log security event (without exposing details to user)
      console.warn("SSL certificate validation failed");
      throw new Error("Secure connection could not be established");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
