import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, RotateCcw, LayoutGrid, Trophy, History, Shield, Flame, Crown, Gift, Sparkles } from 'lucide-react';
import { useCasinoStore } from '../store/casinoStore';
import { useWalletStore } from '../store/walletStore';
import { useBonusStore } from '../store/bonusStore';
import { cn, formatCurrency } from '../utils/helpers';

const games = [
  {
    id: 'crash',
    name: 'CRASH',
    description: 'Predict the multiplier before the rocket explodes.',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-600',
    image: 'https://picsum.photos/seed/crash/800/600',
    badge: 'HOT'
  },
  {
    id: 'roulette',
    name: 'ROULETTE',
    description: 'Classic European Roulette with high stakes.',
    icon: RotateCcw,
    color: 'from-emerald-500 to-teal-700',
    image: 'https://picsum.photos/seed/roulette/800/600',
    badge: 'CLASSIC'
  },
  {
    id: 'slots',
    name: 'SLOTS',
    description: '5-reel neon slots with cascading wins.',
    icon: LayoutGrid,
    color: 'from-purple-500 to-indigo-700',
    image: 'https://picsum.photos/seed/slots/800/600',
    badge: 'NEW'
  }
];

export const Lobby = () => {
  const { setActiveGame, progressiveJackpotUSD } = useCasinoStore();
  const { dailyBonusAvailable, claimDailyBonus, activePromotions } = useBonusStore();

  return (
    <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
      <div className="relative mb-16 rounded-[40px] overflow-hidden bg-zinc-900 border border-white/5 p-12 flex flex-col items-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-black/80" />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-2 justify-center mb-4">
            <Flame className="text-orange-500 w-5 h-5 fill-orange-500" />
            <span className="text-xs font-black text-orange-500 uppercase tracking-[0.4em]">Progressive Jackpot</span>
          </div>
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white via-yellow-200 to-yellow-600">
            {formatCurrency(progressiveJackpotUSD)} <span className="text-2xl align-middle">USD</span>
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-lg font-medium mb-8">
            The ultimate decentralized casino experience on <span className="text-emerald-400 font-bold">Base Mainnet</span>. 
            Provably fair, instant payouts, and zero-custody.
          </p>

          <div className="flex gap-4 justify-center">
            <button 
              onClick={claimDailyBonus}
              disabled={!dailyBonusAvailable}
              className={cn(
                "px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all",
                dailyBonusAvailable 
                  ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)]" 
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              )}
            >
              <Gift className="w-5 h-5" />
              {dailyBonusAvailable ? 'CLAIM DAILY BONUS' : 'BONUS CLAIMED'}
            </button>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black flex items-center gap-2 border border-white/10 transition-all">
              <Sparkles className="w-5 h-5 text-purple-400" />
              PROMOTIONS
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {games.map((game, idx) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setActiveGame(game.id)}
            className="group relative h-[450px] rounded-[32px] overflow-hidden cursor-pointer border border-white/5 hover:border-yellow-500/30 transition-all duration-500 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            <img 
              src={game.image} 
              alt={game.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40"
              referrerPolicy="no-referrer"
            />
            
            <div className="absolute top-6 right-6 z-20">
              <div className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black tracking-widest text-yellow-500">
                {game.badge}
              </div>
            </div>

            <div className="absolute inset-0 z-20 p-10 flex flex-col justify-end">
              <div className={cn(
                "w-14 h-14 rounded-2xl bg-gradient-to-br mb-6 flex items-center justify-center shadow-2xl",
                game.color
              )}>
                <game.icon className="text-white w-7 h-7" />
              </div>
              <h3 className="text-4xl font-black tracking-tight mb-3 group-hover:text-yellow-400 transition-colors">{game.name}</h3>
              <p className="text-zinc-400 text-sm mb-8 line-clamp-2 font-medium">{game.description}</p>
              <button className="w-full py-4 bg-white/5 group-hover:bg-yellow-500 group-hover:text-black backdrop-blur-md rounded-2xl font-black transition-all duration-300 border border-white/10 group-hover:border-transparent">
                PLAY NOW
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[32px] p-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <History className="text-emerald-400 w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">LIVE BETS</h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Feed
            </div>
          </div>
          
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center text-xs font-bold text-zinc-500">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">0x71...{842 + i}</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Crash @ 2.45x</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-black text-emerald-400">+{(Math.random() * 50).toFixed(2)} USDT</div>
                  <div className="text-[10px] text-zinc-500 font-bold">Just now</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[32px] p-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Crown className="text-yellow-500 w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">LEADERBOARD</h2>
          </div>
          
          <div className="space-y-6">
            {[
              { user: '0x82...1a2b', profit: 12540.50 },
              { user: '0x34...9f8e', profit: 8420.20 },
              { user: '0x1c...7d6c', profit: 5100.00 },
              { user: '0x9a...4b3a', profit: 3200.15 },
              { user: '0xef...2e1d', profit: 1850.00 },
            ].map((winner, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "text-lg font-black",
                    i === 0 ? "text-yellow-500" : i === 1 ? "text-zinc-300" : i === 2 ? "text-orange-400" : "text-zinc-600"
                  )}>#{i + 1}</span>
                  <span className="text-sm font-bold text-zinc-300">{winner.user}</span>
                </div>
                <div className="text-sm font-mono font-black text-white">{formatCurrency(winner.profit)}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-2xl">
            <Shield className="text-yellow-500 w-6 h-6 mb-3" />
            <h4 className="text-sm font-black mb-1">PROVABLY FAIR</h4>
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
              Every outcome is cryptographically verifiable. We use HMAC-SHA512 to ensure total transparency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
