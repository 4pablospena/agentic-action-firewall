import * as ed from "@noble/ed25519";
import { sha256 } from "@noble/hashes/sha256";
import { sha512 } from "@noble/hashes/sha512";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils";

ed.etc.sha512Sync = (...messages: Uint8Array[]) =>
  sha512(ed.etc.concatBytes(...messages));

export const GENESIS_HASH = "0".repeat(64);

export function sha256Hex(input: string): string {
  return bytesToHex(sha256(utf8ToBytes(input)));
}

export function sha256HexObject(value: unknown): string {
  return sha256Hex(JSON.stringify(value));
}

export async function signPayload(
  privateKey: Uint8Array,
  payload: string,
): Promise<string> {
  const signature = await ed.signAsync(utf8ToBytes(payload), privateKey);
  return bytesToHex(signature);
}

export async function verifySignature(
  publicKey: Uint8Array,
  payload: string,
  signatureHex: string,
): Promise<boolean> {
  try {
    const signature = hexToBytes(signatureHex);
    return ed.verifyAsync(signature, utf8ToBytes(payload), publicKey);
  } catch {
    return false;
  }
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function generateKeypair(): { privateKey: Uint8Array; publicKey: Uint8Array } {
  const privateKey = ed.utils.randomPrivateKey();
  return { privateKey, publicKey: ed.getPublicKey(privateKey) };
}
