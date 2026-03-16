import React from 'react';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { CrashGame } from './games/CrashGame';
import { RouletteGame } from './games/RouletteGame';
import { SlotsGame } from './games/SlotsGame';
import { useCasinoStore } from './store/casinoStore';
import { useWalletStore } from './store/walletStore';
import { ArrowLeft, BarChart3, Users, TrendingUp, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from './utils/helpers';

import { AdminPanel } from './components/AdminPanel';

const ADMIN_ADDRESSES = ['0xotaviogimenes3@gmail.com', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e']; // Example

export default function App() {
  const { activeGame, setActiveGame, stats } = useCasinoStore();
  const { address } = useWalletStore();
  const [view, setView] = React.useState<'casino' | 'admin'>('casino');

  const isAuthorizedAdmin = address && ADMIN_ADDRESSES.map(a => a.toLowerCase()).includes(address.toLowerCase());

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-emerald-500/30">
      <Navbar />
      
      <main className="relative">
        <AnimatePresence mode="wait">
          {view === 'admin' && isAuthorizedAdmin ? (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="max-w-7xl mx-auto px-6 pt-24">
                <button onClick={() => setView('casino')} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 group">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Casino
                </button>
              </div>
              <AdminPanel />
            </motion.div>
          ) : !activeGame ? (
            <motion.div
              key="lobby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Lobby />
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pb-20"
            >
              <div className="max-w-7xl mx-auto px-6 pt-24">
                <button 
                  onClick={() => setActiveGame(null)}
                  className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Lobby
                </button>
              </div>

              {activeGame === 'crash' && <CrashGame />}
              {activeGame === 'roulette' && <RouletteGame />}
              {activeGame === 'slots' && <SlotsGame />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Stats Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-xl border-t border-white/5 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            {isAuthorizedAdmin && (
              <button 
                onClick={() => setView(view === 'admin' ? 'casino' : 'admin')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity text-yellow-500"
              >
                <LayoutDashboard className="w-4 h-4" />
                <div className="text-[10px] font-black uppercase tracking-widest">Admin Panel</div>
              </button>
            )}

            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Volume</div>
              <div className="text-xs font-mono font-black">${formatCurrency(stats.totalBetsUSD)}</div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Online</div>
              <div className="text-xs font-mono font-black">{stats.activePlayers + 1240}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20">
            <ShieldCheck className="w-3 h-3 text-yellow-500" />
            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Base Mainnet Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
