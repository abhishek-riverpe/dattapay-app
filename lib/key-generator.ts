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

function isValidPrivateKey(key: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(key);
}

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

async function generateSalt(): Promise<string> {
  const saltBytes = Crypto.getRandomBytes(32);
  return Array.from(saltBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function deriveEncryptionKey(salt: string): Promise<string> {
  const installationId = Constants.installationId || "unknown";
  const input = `dattapay_key_${salt}_${installationId}_encryption`;
  const hash = CryptoJS.SHA256(input);
  return hash.toString(CryptoJS.enc.Hex).substring(0, 32);
}

function encryptPrivateKey(privateKey: string, encryptionKey: string): string {
  const encrypted = CryptoJS.AES.encrypt(privateKey, encryptionKey);
  return encrypted.toString();
}

function decryptPrivateKey(
  encryptedKey: string,
  encryptionKey: string
): string {
  const decrypted = CryptoJS.AES.decrypt(encryptedKey, encryptionKey);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

function generateKeyPair(): KeyPair {
  const entropy = Crypto.getRandomBytes(32);
  const entropyHex = Array.from(entropy)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const keyPair = getEC().genKeyPair({ entropy: entropyHex });
  const compressedPublicKey = keyPair.getPublic(true, "hex");
  const privateKeyHex = keyPair.getPrivate("hex").padStart(64, "0");

  return {
    publicKey: compressedPublicKey,
    privateKey: privateKeyHex,
  };
}

async function savePrivateKey(privateKey: string): Promise<void> {
  const salt = await generateSalt();
  await SecureStore.setItemAsync(KEY_SALT_ALIAS, salt);
  const encryptionKey = await deriveEncryptionKey(salt);
  const encryptedKey = encryptPrivateKey(privateKey, encryptionKey);
  await SecureStore.setItemAsync(PRIVATE_KEY_ALIAS, encryptedKey);
}

async function savePublicKey(publicKey: string): Promise<void> {
  await SecureStore.setItemAsync(PUBLIC_KEY_ALIAS, publicKey);
}

export async function getPublicKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(PUBLIC_KEY_ALIAS);
}

async function requireBiometricAuth(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
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

export async function getPrivateKey(): Promise<string | null> {
  const storedKey = await SecureStore.getItemAsync(PRIVATE_KEY_ALIAS);
  const salt = await SecureStore.getItemAsync(KEY_SALT_ALIAS);

  if (!storedKey) {
    return null;
  }

  const authSuccess = await requireBiometricAuth();
  if (!authSuccess) {
    throw new Error("Biometric authentication required");
  }

  if (isValidPrivateKey(storedKey)) {
    if (!salt) {
      const newSalt = await generateSalt();
      await SecureStore.setItemAsync(KEY_SALT_ALIAS, newSalt);
      const encryptionKey = await deriveEncryptionKey(newSalt);
      const encryptedKey = encryptPrivateKey(storedKey, encryptionKey);
      await SecureStore.setItemAsync(PRIVATE_KEY_ALIAS, encryptedKey);
    }
    return storedKey;
  }

  if (!salt) {
    return null;
  }

  const encryptionKey = await deriveEncryptionKey(salt);
  const privateKey = decryptPrivateKey(storedKey, encryptionKey);

  if (!isValidPrivateKey(privateKey)) {
    return null;
  }

  return privateKey;
}

export async function hasExistingKeys(): Promise<boolean> {
  const publicKey = await getPublicKey();
  return publicKey !== null;
}

let isGeneratingKeys = false;
export async function generateAndStoreKeys(): Promise<string> {
  if (isGeneratingKeys) {
    throw new Error("Key generation already in progress");
  }

  const existingKey = await getPublicKey();
  if (existingKey) {
    return existingKey;
  }

  isGeneratingKeys = true;
  try {
    const { publicKey, privateKey } = generateKeyPair();
    await savePrivateKey(privateKey);
    await savePublicKey(publicKey);

    return publicKey;
  } finally {
    isGeneratingKeys = false;
  }
}

export async function deleteKeys(): Promise<void> {
  await SecureStore.deleteItemAsync(PRIVATE_KEY_ALIAS);
  await SecureStore.deleteItemAsync(PUBLIC_KEY_ALIAS);
  await SecureStore.deleteItemAsync(KEY_SALT_ALIAS);
}
