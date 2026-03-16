import { ProvablyFair } from './rng';

export class RouletteEngine {
  static HOUSE_EDGE = 0.027; // 2.7% (European)

  static getResult(serverSeed: string, clientSeed: string, nonce: number): number {
    const hash = ProvablyFair.generateResult(serverSeed, clientSeed, nonce);
    const r = ProvablyFair.hashToFloat(hash);
    return Math.floor(r * 37); // 0-36
  }

  static calculatePayout(betAmount: number, betNumbers: number[], result: number): number {
    if (betNumbers.includes(result)) {
      // Payout is 36 / numbers_bet
      const multiplier = 36 / betNumbers.length;
      return betAmount * multiplier;
    }
    return 0;
  }
}
