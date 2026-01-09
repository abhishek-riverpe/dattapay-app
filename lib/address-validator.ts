const BASE58_CHARS =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_MAP: { [key: string]: number } = {};
for (let i = 0; i < BASE58_CHARS.length; i++) {
  BASE58_MAP[BASE58_CHARS[i]] = i;
}

function base58Decode(str: string): Uint8Array | null {
  try {
    if (!str || str.length === 0) return null;
    let result = BigInt(0);
    for (const char of str) {
      if (!(char in BASE58_MAP)) return null;
      result = result * BigInt(58) + BigInt(BASE58_MAP[char]);
    }

    const bytes: number[] = [];
    while (result > 0) {
      bytes.unshift(Number(result % BigInt(256)));
      result = result / BigInt(256);
    }

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

export function isValidSolanaAddress(address: string): boolean {
  if (!address || typeof address !== "string") {
    return false;
  }
  const trimmed = address.trim();

  if (trimmed.length < 32 || trimmed.length > 44) {
    return false;
  }

  for (const char of trimmed) {
    if (!BASE58_CHARS.includes(char)) {
      return false;
    }
  }

  const decoded = base58Decode(trimmed);
  if (decoded?.length !== 32) {
    return false;
  }

  return true;
}

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

  for (const char of trimmed) {
    if (!BASE58_CHARS.includes(char)) {
      return "Address contains invalid characters";
    }
  }

  const decoded = base58Decode(trimmed);
  if (decoded?.length !== 32) {
    return "Invalid Solana address format";
  }

  return null;
}

export function sanitizeSolanaAddress(address: string): string | null {
  if (!isValidSolanaAddress(address)) {
    return null;
  }
  return address.trim();
}
