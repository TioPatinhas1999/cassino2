import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Users, ShieldAlert, RefreshCcw } from 'lucide-react';
import { useCasinoStore } from '../store/casinoStore';
import { formatCurrency } from '../utils/helpers';

export const AdminPanel = () => {
  const { stats } = useCasinoStore();

  return (
    <div className="max-w-4xl mx-auto pt-24 px-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
          <ShieldAlert className="text-yellow-500 w-8 h-8" />
          VAULT CONTROL
        </h2>
        <div className="px-4 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-black tracking-widest border border-yellow-500/20">
          BASE MAINNET ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Volume</div>
          <div className="text-3xl font-mono font-black text-white">${formatCurrency(stats.totalBetsUSD)}</div>
          <div className="mt-4 flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>+12.5% GROWTH</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">House Profit</div>
          <div className="text-3xl font-mono font-black text-yellow-500">${formatCurrency(stats.houseProfitUSD)}</div>
          <div className="mt-4 flex items-center gap-1 text-zinc-500 text-[10px] font-bold">
            <BarChart3 className="w-3 h-3" />
            <span>Target Margin: 4.00%</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Active Players</div>
          <div className="text-3xl font-mono font-black text-white">{stats.activePlayers}</div>
          <div className="mt-4 flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
            <Users className="w-3 h-3" />
            <span>98.2% RETENTION</span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold">Game Performance</h3>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <RefreshCcw className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {[
            { name: 'Crash', rtp: 96.0, bets: 4520, profit: 180.5 },
            { name: 'Roulette', rtp: 97.3, bets: 2100, profit: 56.7 },
            { name: 'Slots', rtp: 96.5, bets: 8900, profit: 311.5 },
          ].map((game) => (
            <div key={game.name} className="flex items-center justify-between">
              <div>
                <div className="font-bold">{game.name}</div>
                <div className="text-xs text-zinc-500">Target RTP: {game.rtp}%</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm">{formatCurrency(game.bets)} USDT</div>
                <div className="text-xs text-emerald-400">+{game.profit} USDT</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
