import axios from "axios";
import { getClerkInstance } from "@clerk/clerk-expo";
import { getOrCreateAdminToken } from "./token-generator";

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const clerk = getClerkInstance();
    const authToken = await clerk.session?.getToken();
    const adminToken = await getOrCreateAdminToken();

    if (adminToken) {
      config.headers["x-api-token"] = adminToken;
    }
    if (authToken) {
      config.headers["x-auth-token"] = authToken;
    }
  } catch (error) {
    console.warn("Failed to get tokens:", error);
  }
  return config;
});

export default apiClient;
