import { create } from 'zustand';

interface BonusState {
  dailyBonusAvailable: boolean;
  lastClaimed: number | null;
  activePromotions: any[];
  
  claimDailyBonus: () => Promise<void>;
  fetchPromotions: () => Promise<void>;
}

export const useBonusStore = create<BonusState>((set, get) => ({
  dailyBonusAvailable: true,
  lastClaimed: null,
  activePromotions: [
    { id: 1, title: 'Welcome Bonus', description: 'Get 10% extra on your first deposit', code: 'WELCOME10' },
    { id: 2, title: 'Weekend Reload', description: '20% bonus on all weekend bets', code: 'WEEKEND20' }
  ],

  claimDailyBonus: async () => {
    // Simulate API call
    set({ dailyBonusAvailable: false, lastClaimed: Date.now() });
  },

  fetchPromotions: async () => {
    // Fetch from API
  }
}));
