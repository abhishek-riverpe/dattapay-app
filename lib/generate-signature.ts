import elliptic from "elliptic";
import * as Crypto from "expo-crypto";

const EC = elliptic.ec;
const ec = new EC("p256");

// SHA-256 hashing function using expo-crypto
const sha256 = async (input: string): Promise<string> => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input
  );
};

// Base64URL encoding
const toBase64Url = (str: string): string => {
  const b64 = btoa(str);
  return b64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

interface SignInput {
  payload: string;
  publicKey: string;
  privateKey: string;
}

const generateSignature = async ({ payload, publicKey, privateKey }: SignInput) => {
  if (!payload || !privateKey || !publicKey) return;
  try {
    const key = ec.keyFromPrivate(privateKey, "hex");
    const hashHex = await sha256(payload);
    const signature = key.sign(hashHex, { canonical: true });
    const derHex = signature.toDER("hex");

    const stampObj = {
      publicKey,
      scheme: "SIGNATURE_SCHEME_TK_API_P256",
      signature: derHex,
    };

    return toBase64Url(JSON.stringify(stampObj));
  } catch (error) {
    console.error("Error signing payload:", error);
    throw error;
  }
};

export default generateSignature;
