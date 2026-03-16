import { ProvablyFair } from './rng';

export enum SymbolType {
  LOW_1 = 0,
  LOW_2 = 1,
  LOW_3 = 2,
  LOW_4 = 3,
  HIGH_1 = 4,
  HIGH_2 = 5,
  HIGH_3 = 6,
  WILD = 7,
  SCATTER = 8,
  BONUS = 9
}

export const PAYLINES = [
  { id: 1, positions: [1, 1, 1, 1, 1] },
  { id: 2, positions: [0, 0, 0, 0, 0] },
  { id: 3, positions: [2, 2, 2, 2, 2] },
  { id: 4, positions: [0, 1, 2, 1, 0] },
  { id: 5, positions: [2, 1, 0, 1, 2] },
  { id: 6, positions: [0, 0, 1, 2, 2] },
  { id: 7, positions: [2, 2, 1, 0, 0] },
  { id: 8, positions: [1, 0, 0, 0, 1] },
  { id: 9, positions: [1, 2, 2, 2, 1] },
  { id: 10, positions: [0, 1, 0, 1, 0] },
  { id: 11, positions: [2, 1, 2, 1, 2] },
  { id: 12, positions: [1, 0, 1, 2, 1] },
  { id: 13, positions: [1, 2, 1, 0, 1] },
  { id: 14, positions: [0, 2, 0, 2, 0] },
  { id: 15, positions: [2, 0, 2, 0, 2] },
  { id: 16, positions: [1, 1, 0, 1, 1] },
  { id: 17, positions: [1, 1, 2, 1, 1] },
  { id: 18, positions: [0, 1, 1, 1, 0] },
  { id: 19, positions: [2, 1, 1, 1, 2] },
  { id: 20, positions: [0, 0, 2, 0, 0] }
];

export const PAYTABLE: Record<number, number[]> = {
  [SymbolType.LOW_1]: [0, 0, 2, 5, 10],
  [SymbolType.LOW_2]: [0, 0, 2, 5, 10],
  [SymbolType.LOW_3]: [0, 0, 3, 8, 15],
  [SymbolType.LOW_4]: [0, 0, 3, 8, 15],
  [SymbolType.HIGH_1]: [0, 0, 10, 25, 50],
  [SymbolType.HIGH_2]: [0, 0, 15, 40, 100],
  [SymbolType.HIGH_3]: [0, 0, 20, 60, 200],
  [SymbolType.WILD]: [0, 0, 50, 200, 1000],
  [SymbolType.SCATTER]: [0, 0, 2, 10, 50],
  [SymbolType.BONUS]: [0, 0, 0, 0, 0]
};

export const REELS: SymbolType[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 0, 1, 2, 0, 1, 0]
];

export class SlotsEngine {
  static RTP = 0.96;

  static getResult(serverSeed: string, clientSeed: string, nonce: number): SymbolType[][] {
    const hash = ProvablyFair.generateResult(serverSeed, clientSeed, nonce);
    const grid: SymbolType[][] = [];
    
    for (let col = 0; col < 5; col++) {
      const reel: SymbolType[] = [];
      for (let row = 0; row < 3; row++) {
        const segment = hash.substring((col * 3 + row) * 4, (col * 3 + row) * 4 + 4);
        const r = parseInt(segment, 16) / Math.pow(16, 4);
        const reelIndex = Math.floor(r * REELS[col].length);
        reel.push(REELS[col][reelIndex]);
      }
      grid.push(reel);
    }
    return grid;
  }

  static calculateWin(grid: SymbolType[][], betPerLine: number): { totalWin: number, winningLines: any[] } {
    let totalWin = 0;
    const winningLines = [];

    for (const line of PAYLINES) {
      const symbolsOnLine = line.positions.map((row, col) => grid[col][row]);
      let matchCount = 1;
      let firstSymbol = symbolsOnLine[0];
      let isWildMatch = firstSymbol === SymbolType.WILD;

      for (let i = 1; i < 5; i++) {
        const currentSymbol = symbolsOnLine[i];
        if (isWildMatch && currentSymbol !== SymbolType.WILD && currentSymbol !== SymbolType.SCATTER && currentSymbol !== SymbolType.BONUS) {
          firstSymbol = currentSymbol;
          isWildMatch = false;
          matchCount++;
        } else if (currentSymbol === firstSymbol || currentSymbol === SymbolType.WILD) {
          matchCount++;
        } else {
          break;
        }
      }

      if (matchCount >= 3) {
        const payout = PAYTABLE[firstSymbol][matchCount - 1];
        if (payout > 0) {
          const win = payout * betPerLine;
          totalWin += win;
          winningLines.push({ lineId: line.id, matchCount, symbol: firstSymbol, win });
        }
      }
    }

    let scatterCount = 0;
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 3; row++) {
        if (grid[col][row] === SymbolType.SCATTER) scatterCount++;
      }
    }
    if (scatterCount >= 3) {
      const scatterPayout = PAYTABLE[SymbolType.SCATTER][scatterCount - 1] * (betPerLine * 20);
      totalWin += scatterPayout;
      winningLines.push({ type: 'SCATTER', count: scatterCount, win: scatterPayout });
    }

    return { totalWin, winningLines };
  }
}
