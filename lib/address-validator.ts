// Base58 character set for Solana addresses
const BASE58_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_MAP: { [key: string]: number } = {};
for (let i = 0; i < BASE58_CHARS.length; i++) {
  BASE58_MAP[BASE58_CHARS[i]] = i;
}

/**
 * Decode a base58 string to bytes
 * Returns null if decoding fails
 */
function base58Decode(str: string): Uint8Array | null {
  try {
    if (!str || str.length === 0) return null;

    // Convert base58 string to big integer
    let result = BigInt(0);
    for (const char of str) {
      if (!(char in BASE58_MAP)) return null;
      result = result * BigInt(58) + BigInt(BASE58_MAP[char]);
    }

    // Convert big integer to bytes
    const bytes: number[] = [];
    while (result > 0) {
      bytes.unshift(Number(result % BigInt(256)));
      result = result / BigInt(256);
    }

    // Handle leading zeros (represented as '1' in base58)
    for (const char of str) {
      if (char === "1") {
        bytes.unshift(0);
      } else {
        break;
      }
    }

    return new Uint8Array(bytes);
  } catch {
    return null;
  }
}

/**
 * Validates a Solana address format with proper base58 decoding
 * Solana addresses are 32-byte public keys encoded in base58
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

  // Attempt to decode and verify it produces exactly 32 bytes (Solana public key size)
  const decoded = base58Decode(trimmed);
  if (!decoded || decoded.length !== 32) {
    return false;
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

  // Verify base58 decoding produces exactly 32 bytes
  const decoded = base58Decode(trimmed);
  if (!decoded || decoded.length !== 32) {
    return "Invalid Solana address format";
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
