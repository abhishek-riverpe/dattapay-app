import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import * as LocalAuthentication from "expo-local-authentication";
import Constants from "expo-constants";
import elliptic from "elliptic";
import CryptoJS from "crypto-js";

const EC = elliptic.ec;
let ec: InstanceType<typeof EC> | null = null;

function getEC() {
  if (!ec) {
    ec = new EC("p256");
  }
  return ec;
}

const PRIVATE_KEY_ALIAS = "dattapay_private_key";
const PUBLIC_KEY_ALIAS = "dattapay_public_key";
const KEY_SALT_ALIAS = "dattapay_key_salt";

/**
 * Validates if a string is a valid P-256 private key (64 hex chars)
 */
function isValidPrivateKey(key: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(key);
}

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Generates a random salt for key derivation
 */
async function generateSalt(): Promise<string> {
  const saltBytes = Crypto.getRandomBytes(32);
  return Array.from(saltBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Derives an encryption key from device-specific data and salt
 * This provides an additional layer of protection for the private key
 */
async function deriveEncryptionKey(salt: string): Promise<string> {
  // Include device-specific identifier for additional security
  const installationId = Constants.installationId || "unknown";
  const input = `dattapay_key_${salt}_${installationId}_encryption`;
  const hash = CryptoJS.SHA256(input);
  return hash.toString(CryptoJS.enc.Hex).substring(0, 32);
}

/**
 * Encrypts the private key before storing
 */
function encryptPrivateKey(privateKey: string, encryptionKey: string): string {
  const encrypted = CryptoJS.AES.encrypt(privateKey, encryptionKey);
  return encrypted.toString();
}

/**
 * Decrypts the private key after retrieval
 */
function decryptPrivateKey(
  encryptedKey: string,
  encryptionKey: string
): string {
  const decrypted = CryptoJS.AES.decrypt(encryptedKey, encryptionKey);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Generates a new ECDSA P-256 key pair using expo-crypto for entropy
 */
function generateKeyPair(): KeyPair {
  // Generate 32 bytes of random entropy using expo-crypto
  const entropy = Crypto.getRandomBytes(32);
  const entropyHex = Array.from(entropy)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Generate key pair with provided entropy
  const keyPair = getEC().genKeyPair({ entropy: entropyHex });
  const compressedPublicKey = keyPair.getPublic(true, "hex");
  const privateKeyHex = keyPair.getPrivate("hex").padStart(64, "0");

  return {
    publicKey: compressedPublicKey,
    privateKey: privateKeyHex,
  };
}

/**
 * Saves the private key to secure storage with additional encryption
 */
async function savePrivateKey(privateKey: string): Promise<void> {
  // Generate and store a salt
  const salt = await generateSalt();
  await SecureStore.setItemAsync(KEY_SALT_ALIAS, salt);

  // Derive encryption key and encrypt the private key
  const encryptionKey = await deriveEncryptionKey(salt);
  const encryptedKey = encryptPrivateKey(privateKey, encryptionKey);

  // Store the encrypted private key
  await SecureStore.setItemAsync(PRIVATE_KEY_ALIAS, encryptedKey);
}

/**
 * Saves the public key to SecureStore
 */
async function savePublicKey(publicKey: string): Promise<void> {
  await SecureStore.setItemAsync(PUBLIC_KEY_ALIAS, publicKey);
}

/**
 * Retrieves the public key from SecureStore
 */
export async function getPublicKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(PUBLIC_KEY_ALIAS);
}

/**
 * Verifies biometric authentication before allowing key access
 */
async function requireBiometricAuth(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

    // Require device security
    if (
      !hasHardware &&
      securityLevel === LocalAuthentication.SecurityLevel.NONE
    ) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to access your keys",
      fallbackLabel: "Use Passcode",
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
    });

    return result.success;
  } catch {
    return false;
  }
}

/**
 * Retrieves the private key from secure storage
 * Requires biometric authentication for access
 * Handles migration of legacy unencrypted keys
 */
export async function getPrivateKey(): Promise<string | null> {
  const storedKey = await SecureStore.getItemAsync(PRIVATE_KEY_ALIAS);
  const salt = await SecureStore.getItemAsync(KEY_SALT_ALIAS);

  if (!storedKey) {
    return null; // No key exists
  }

  // Require biometric auth to access keys
  const authSuccess = await requireBiometricAuth();
  if (!authSuccess) {
    throw new Error("Biometric authentication required");
  }

  // Check if this is a legacy unencrypted key (64 hex chars)
  if (isValidPrivateKey(storedKey)) {
    // Migrate: encrypt and store properly for future access
    if (!salt) {
      const newSalt = await generateSalt();
      await SecureStore.setItemAsync(KEY_SALT_ALIAS, newSalt);
      const encryptionKey = await deriveEncryptionKey(newSalt);
      const encryptedKey = encryptPrivateKey(storedKey, encryptionKey);
      await SecureStore.setItemAsync(PRIVATE_KEY_ALIAS, encryptedKey);
    }
    return storedKey;
  }

  // Key is encrypted - decrypt it
  if (!salt) {
    return null; // Encrypted key but no salt = corrupted state
  }

  const encryptionKey = await deriveEncryptionKey(salt);
  const privateKey = decryptPrivateKey(storedKey, encryptionKey);

  if (!isValidPrivateKey(privateKey)) {
    return null; // Decryption failed
  }

  return privateKey;
}

/**
 * Checks if keys have already been generated
 */
export async function hasExistingKeys(): Promise<boolean> {
  const publicKey = await getPublicKey();
  return publicKey !== null;
}

// Mutex to prevent concurrent key generation
let isGeneratingKeys = false;

/**
 * Generates and stores a new key pair
 * Only call this on first address submission
 * Returns the public key for sending to the server
 */
export async function generateAndStoreKeys(): Promise<string> {
  // Prevent concurrent key generation
  if (isGeneratingKeys) {
    throw new Error("Key generation already in progress");
  }

  // Check if keys already exist
  const existingKey = await getPublicKey();
  if (existingKey) {
    return existingKey;
  }

  isGeneratingKeys = true;
  try {
    const { publicKey, privateKey } = generateKeyPair();

    // Save private key with additional encryption
    await savePrivateKey(privateKey);

    // Save public key to SecureStore
    await savePublicKey(publicKey);

    return publicKey;
  } finally {
    isGeneratingKeys = false;
  }
}

/**
 * Securely deletes all stored keys
 */
export async function deleteKeys(): Promise<void> {
  await SecureStore.deleteItemAsync(PRIVATE_KEY_ALIAS);
  await SecureStore.deleteItemAsync(PUBLIC_KEY_ALIAS);
  await SecureStore.deleteItemAsync(KEY_SALT_ALIAS);
}
