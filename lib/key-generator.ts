import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import elliptic from "elliptic";

const EC = elliptic.ec;
const ec = new EC("p256");

const PRIVATE_KEY_ALIAS = "dattapay_private_key";
const PUBLIC_KEY_ALIAS = "dattapay_public_key";

interface KeyPair {
  publicKey: string;
  privateKey: string;
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
  const keyPair = ec.genKeyPair({ entropy: entropyHex });
  const compressedPublicKey = keyPair.getPublic(true, "hex");
  const privateKeyHex = keyPair.getPrivate("hex").padStart(64, "0");

  return {
    publicKey: compressedPublicKey,
    privateKey: privateKeyHex,
  };
}

/**
 * Saves the private key to secure storage
 */
async function savePrivateKey(privateKey: string): Promise<void> {
  await SecureStore.setItemAsync(PRIVATE_KEY_ALIAS, privateKey);
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
 * Retrieves the private key from secure storage
 */
export async function getPrivateKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(PRIVATE_KEY_ALIAS);
}

/**
 * Checks if keys have already been generated
 */
export async function hasExistingKeys(): Promise<boolean> {
  const publicKey = await getPublicKey();
  return publicKey !== null;
}

/**
 * Generates and stores a new key pair
 * Only call this on first address submission
 * Returns the public key for sending to the server
 */
export async function generateAndStoreKeys(): Promise<string> {
  const { publicKey, privateKey } = generateKeyPair();

  // Save private key to secure storage
  await savePrivateKey(privateKey);

  // Save public key to SecureStore
  await savePublicKey(publicKey);

  return publicKey;
}
