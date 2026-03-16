import { create } from 'zustand';
import { ProvablyFair } from '../engine/rng';

interface CasinoState {
  activeGame: string | null;
  setActiveGame: (game: string | null) => void;
  history: any[];
  addHistory: (entry: any) => void;
  progressiveJackpotUSD: number;
  incrementJackpot: (amount: number) => void;
  resetJackpot: () => void;
  stats: {
    totalBetsUSD: number;
    totalWinningsUSD: number;
    houseProfitUSD: number;
    activePlayers: number;
  };
  updateStats: (betUSD: number, winUSD: number) => void;
  clientSeed: string;
  serverSeedHash: string;
  nonce: number;
  setClientSeed: (seed: string) => void;
  incrementNonce: () => void;
  rotateServerSeed: () => void;
}

export const useCasinoStore = create<CasinoState>((set) => ({
  activeGame: null,
  setActiveGame: (activeGame) => set({ activeGame }),
  history: [],
  addHistory: (entry) => set((state) => ({ history: [entry, ...state.history].slice(0, 50) })),
  progressiveJackpotUSD: 125400.00,
  incrementJackpot: (amount) => set((state) => ({ progressiveJackpotUSD: state.progressiveJackpotUSD + amount })),
  resetJackpot: () => set({ progressiveJackpotUSD: 50000.00 }),
  stats: {
    totalBetsUSD: 15420300,
    totalWinningsUSD: 14800200,
    houseProfitUSD: 620100,
    activePlayers: 1248,
  },
  updateStats: (betUSD, winUSD) => set((state) => {
    const newTotalBets = state.stats.totalBetsUSD + betUSD;
    const newTotalWinnings = state.stats.totalWinningsUSD + winUSD;
    return {
      stats: {
        ...state.stats,
        totalBetsUSD: newTotalBets,
        totalWinningsUSD: newTotalWinnings,
        houseProfitUSD: newTotalBets - newTotalWinnings,
      },
      progressiveJackpotUSD: state.progressiveJackpotUSD + (betUSD * 0.01),
    };
  }),
  clientSeed: Math.random().toString(36).substring(7),
  serverSeedHash: ProvablyFair.hashServerSeed(ProvablyFair.generateServerSeed()),
  nonce: 0,
  setClientSeed: (clientSeed) => set({ clientSeed }),
  incrementNonce: () => set((state) => ({ nonce: state.nonce + 1 })),
  rotateServerSeed: () => set({ 
    serverSeedHash: ProvablyFair.hashServerSeed(ProvablyFair.generateServerSeed()),
    nonce: 0 
  }),
}));
