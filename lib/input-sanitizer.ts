/**
 * Input sanitization utilities for user-provided data
 */

/**
 * Sanitizes a text label by removing potentially dangerous characters
 * Allows alphanumeric, spaces, and common punctuation
 */
export function sanitizeLabel(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Limit length first to prevent ReDoS
  let sanitized = input.length > 1000 ? input.substring(0, 1000) : input;

  // Remove control characters and null bytes
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");

  // Remove any HTML/script tags (bounded quantifier to prevent ReDoS)
  sanitized = sanitized.replace(/<[^>]{0,500}>/g, "");

  // Remove potential SQL injection characters
  sanitized = sanitized.replace(/[;'"\\]/g, "");

  // Trim whitespace and limit length
  sanitized = sanitized.trim().substring(0, 100);

  return sanitized;
}

/**
 * Sanitizes numeric input to ensure it's a valid positive number
 */
export function sanitizeAmount(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Only allow digits and one decimal point
  const sanitized = input.replace(/[^0-9.]/g, "");

  // Ensure only one decimal point
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("");
  }

  // Limit decimal places to 2
  if (parts.length === 2 && parts[1].length > 2) {
    return parts[0] + "." + parts[1].substring(0, 2);
  }

  return sanitized;
}

/**
 * Validates and sanitizes generic text input
 * More permissive than sanitizeLabel but still safe
 */
export function sanitizeText(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Limit length first to prevent ReDoS
  let sanitized = input.length > maxLength * 2 ? input.substring(0, maxLength * 2) : input;

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Remove any HTML/script tags (bounded quantifier to prevent ReDoS)
  sanitized = sanitized.replace(/<[^>]{0,500}>/g, "");

  // Trim and limit length
  return sanitized.trim().substring(0, maxLength);
}
