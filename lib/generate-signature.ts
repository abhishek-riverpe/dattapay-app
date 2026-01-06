import elliptic from "elliptic";
import * as Crypto from "expo-crypto";

const EC = elliptic.ec;
let ec: InstanceType<typeof EC> | null = null;

function getEC() {
  if (!ec) {
    ec = new EC("p256");
  }
  return ec;
}

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
    const key = getEC().keyFromPrivate(privateKey, "hex");
    const hashHex = await sha256(payload);
    const signature = key.sign(hashHex, { canonical: true });
    const derHex = signature.toDER("hex");

    const stampObj = {
      publicKey,
      scheme: "SIGNATURE_SCHEME_TK_API_P256",
      signature: derHex,
    };

    return toBase64Url(JSON.stringify(stampObj));
  } catch {
    // Use generic error message to prevent exposing private key or signature details
    throw new Error("Failed to generate signature");
  }
};

export default generateSignature;
