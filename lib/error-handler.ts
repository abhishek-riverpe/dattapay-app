import { AxiosError } from "axios";

// Map of server error patterns to user-friendly messages
const ERROR_MESSAGE_MAP: Record<string, string> = {
  "network error": "Unable to connect. Please check your internet connection.",
  "timeout": "Request timed out. Please try again.",
  "unauthorized": "Session expired. Please sign in again.",
  "forbidden": "You don't have permission to perform this action.",
  "not found": "The requested resource was not found.",
  "internal server error": "Something went wrong. Please try again later.",
  "service unavailable": "Service is temporarily unavailable. Please try again later.",
  "bad request": "Invalid request. Please check your input.",
  "conflict": "This action conflicts with existing data.",
  "too many requests": "Too many requests. Please wait a moment and try again.",
};

/**
 * Converts server error messages to user-friendly messages
 * Prevents exposing internal server details to users
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const defaultMessage = "Something went wrong. Please try again.";

  if (!error) {
    return defaultMessage;
  }

  // Handle Axios errors
  if (error instanceof AxiosError) {
    const status = error.response?.status;

    // Handle by status code
    switch (status) {
      case 400:
        return "Please check your input and try again.";
      case 401:
        return "Session expired. Please sign in again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "This action conflicts with existing data.";
      case 422:
        return "Please check your input and try again.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Server is temporarily unavailable. Please try again later.";
    }

    // Network errors
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    if (error.code === "ERR_NETWORK") {
      return "Unable to connect. Please check your internet connection.";
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Check for known patterns
    for (const [pattern, friendlyMessage] of Object.entries(ERROR_MESSAGE_MAP)) {
      if (message.includes(pattern)) {
        return friendlyMessage;
      }
    }
  }

  return defaultMessage;
}

/**
 * Logs error details for debugging without exposing to user
 * In production, this should send to a logging service
 */
export function logError(context: string, error: unknown): void {
  if (__DEV__) {
    console.error(`[${context}]`, error);
  }
  // In production, send to error tracking service (e.g., Sentry)
  // Example: Sentry.captureException(error, { extra: { context } });
}
