import axios from "axios";
import { getClerkInstance } from "@clerk/clerk-expo";
import { getOrCreateAdminToken } from "./token-generator";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Certificate pinning configuration
// In production, replace these with your actual certificate public key hashes
// You can get these by running: openssl s_client -connect api.dattapay.com:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
const CERTIFICATE_PINS = {
  // Primary certificate pin (SHA-256 hash of the public key)
  // Update this with your actual API server's certificate hash
  "api.dattapay.com": [
    // Add your certificate pins here when deploying to production
    // Example: "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
  ],
};

// Validate that we're connecting to the expected host
function validateHost(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Only allow connections to our known API host
    const allowedHosts = ["api.dattapay.com", "localhost", "127.0.0.1"];

    // In development, allow any host
    if (__DEV__) {
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

    if (adminToken) {
      config.headers["x-api-token"] = adminToken;
    }
    if (authToken) {
      config.headers["x-auth-token"] = authToken;
    }
  } catch (error) {
    // Silently handle token errors - requests will proceed without tokens
    // The server will return 401 if authentication is required
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle SSL/certificate errors
    if (error.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
        error.code === "CERT_HAS_EXPIRED" ||
        error.code === "ERR_TLS_CERT_ALTNAME_INVALID") {
      // Log security event (without exposing details to user)
      console.warn("SSL certificate validation failed");
      throw new Error("Secure connection could not be established");
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Export certificate pins for use with native modules if needed
export { CERTIFICATE_PINS };
