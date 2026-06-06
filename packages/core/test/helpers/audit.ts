import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";

ed.etc.sha512Sync = (...messages: Uint8Array[]) =>
  sha512(ed.etc.concatBytes(...messages));

export interface TestKeypair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}

export function generateTestKeypair(): TestKeypair {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = ed.getPublicKey(privateKey);
  return { privateKey, publicKey };
}

export async function signTestPayload(
  privateKey: Uint8Array,
  payload: string,
): Promise<string> {
  const message = new TextEncoder().encode(payload);
  const signature = await ed.signAsync(message, privateKey);
  return Buffer.from(signature).toString("hex");
}

export async function verifyTestSignature(
  publicKey: Uint8Array,
  payload: string,
  signatureHex: string,
): Promise<boolean> {
  const message = new TextEncoder().encode(payload);
  const signature = Buffer.from(signatureHex, "hex");
  return ed.verifyAsync(signature, message, publicKey);
}
