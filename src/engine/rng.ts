import CryptoJS from 'crypto-js';

/**
 * Secure RNG Utility
 */
export function secureRandom(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (Math.pow(2, 32));
}

/**
 * Provably Fair RNG Engine
 * Uses Server Seed, Client Seed, and Nonce to generate deterministic results.
 */
export class ProvablyFair {
  static generateServerSeed(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  static hashServerSeed(serverSeed: string): string {
    return CryptoJS.SHA256(serverSeed).toString();
  }

  static generateResult(serverSeed: string, clientSeed: string, nonce: number): string {
    const combined = `${clientSeed}:${nonce}`;
    return CryptoJS.HmacSHA512(combined, serverSeed).toString();
  }

  static hashToFloat(hash: string): number {
    const partialHash = hash.substring(0, 8);
    const intValue = parseInt(partialHash, 16);
    return intValue / Math.pow(16, 8);
  }
}
