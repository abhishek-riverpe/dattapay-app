// Base58 character set for Solana addresses
const BASE58_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Validates a Solana address format
 * Solana addresses are base58-encoded and 32-44 characters long
 */
export function isValidSolanaAddress(address: string): boolean {
  // Check for null/undefined/empty
  if (!address || typeof address !== "string") {
    return false;
  }

  // Trim whitespace
  const trimmed = address.trim();

  // Solana addresses are typically 32-44 characters
  if (trimmed.length < 32 || trimmed.length > 44) {
    return false;
  }

  // Check that all characters are valid base58
  for (const char of trimmed) {
    if (!BASE58_CHARS.includes(char)) {
      return false;
    }
  }

  return true;
}

/**
 * Returns validation error message or null if valid
 */
export function validateSolanaAddress(address: string): string | null {
  if (!address || typeof address !== "string") {
    return "Address is required";
  }

  const trimmed = address.trim();

  if (trimmed.length === 0) {
    return "Address is required";
  }

  if (trimmed.length < 32) {
    return "Address is too short";
  }

  if (trimmed.length > 44) {
    return "Address is too long";
  }

  // Check for invalid characters
  for (const char of trimmed) {
    if (!BASE58_CHARS.includes(char)) {
      return "Address contains invalid characters";
    }
  }

  return null;
}

/**
 * Sanitizes a wallet address (removes whitespace, validates format)
 * Returns null if invalid
 */
export function sanitizeSolanaAddress(address: string): string | null {
  if (!isValidSolanaAddress(address)) {
    return null;
  }
  return address.trim();
}
