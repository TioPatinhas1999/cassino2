import { ProvablyFair } from './rng';

export class CrashEngine {
  static HOUSE_EDGE = 0.04; // 4%

  /**
   * Generates the crash multiplier for a given seed set
   * @returns multiplier (e.g. 1.54)
   */
  static getResult(serverSeed: string, clientSeed: string, nonce: number): number {
    const hash = ProvablyFair.generateResult(serverSeed, clientSeed, nonce);
    const r = ProvablyFair.hashToFloat(hash);
    
    // 3% instant crash at 1.00x
    if (r < 0.03) return 1.00;
    
    // Target RTP: 96%
    const multiplier = 0.96 / (1 - r);
    return Math.max(1.00, Math.floor(multiplier * 100) / 100);
  }

  static calculatePayout(betAmount: number, cashoutMultiplier: number, actualMultiplier: number): number {
    if (cashoutMultiplier <= actualMultiplier) {
      return betAmount * cashoutMultiplier;
    }
    return 0;
  }
}
