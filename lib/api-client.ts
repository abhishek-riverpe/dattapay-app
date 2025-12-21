import axios from "axios";
import { getClerkInstance } from "@clerk/clerk-expo";

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const clerk = getClerkInstance();
    const token = await clerk.session?.getToken();
    if (token) {
      config.headers["x-api-token"] = process.env.EXPO_PUBLIC_ADMIN_TOKEN;
      config.headers["x-auth-token"] = token;
    }
  } catch (error) {
    console.warn("Failed to get Clerk token:", error);
  }
  return config;
});

export default apiClient;
