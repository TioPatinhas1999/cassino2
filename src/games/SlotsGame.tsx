import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, ShieldCheck, Info, Zap, Trophy, Flame, Settings2 } from 'lucide-react';
import { useCasinoStore } from '../store/casinoStore';
import { useWalletStore } from '../store/walletStore';
import { SlotsEngine, SymbolType, PAYLINES } from '../engine/slotsEngine';
import { ProvablyFair } from '../engine/rng';
import { formatCurrency, cn } from '../utils/helpers';
import confetti from 'canvas-confetti';
import { MIN_BET_USD } from '../constants';

const SYMBOLS = [
  { type: SymbolType.LOW_1, icon: '🍒', label: 'Cherry' },
  { type: SymbolType.LOW_2, icon: '🍇', label: 'Grape' },
  { type: SymbolType.LOW_3, icon: '🍋', label: 'Lemon' },
  { type: SymbolType.LOW_4, icon: '🍊', label: 'Orange' },
  { type: SymbolType.HIGH_1, icon: '🔔', label: 'Bell' },
  { type: SymbolType.HIGH_2, icon: '⭐', label: 'Star' },
  { type: SymbolType.HIGH_3, icon: '💎', label: 'Diamond' },
  { type: SymbolType.WILD, icon: '🃏', label: 'WILD' },
  { type: SymbolType.SCATTER, icon: '💰', label: 'SCATTER' },
  { type: SymbolType.BONUS, icon: '🎁', label: 'BONUS' },
];

export const SlotsGame = () => {
  const { clientSeed, nonce, incrementNonce, addHistory, updateStats, progressiveJackpotUSD } = useCasinoStore();
  const { address, isConnected, balance, setBalance, selectedToken, ethPrice, placeBetOnChain } = useWalletStore();
  
  const [betAmount, setBetAmount] = useState('10.00');
  const [grid, setGrid] = useState<SymbolType[][]>([
    [0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 0]
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [winningLines, setWinningLines] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getTokenValueInUSD = (amount: number) => {
    if (selectedToken.symbol === 'ETH') return amount * ethPrice;
    return amount;
  };

  const spin = async () => {
    const amount = parseFloat(betAmount);
    const usdValue = getTokenValueInUSD(amount);

    if (!isConnected) {
      setError("Please connect your wallet first.");
      return;
    }

    if (usdValue < MIN_BET_USD) {
      setError(`Minimum bet is $${MIN_BET_USD} USD equivalent`);
      return;
    }

    if (amount > parseFloat(balance[selectedToken.symbol])) {
      setError("Insufficient balance.");
      return;
    }
    
    setError(null);
    setIsSpinning(true);
    setWinAmount(0);
    setWinningLines([]);

    try {
      await placeBetOnChain(betAmount, 'Slots');
      
      setBalance(selectedToken.symbol, (parseFloat(balance[selectedToken.symbol]) - amount).toFixed(4));

      // Call Serverless API for result
      const response = await fetch('/api/game/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientSeed,
          nonce,
          serverSeed: ProvablyFair.generateServerSeed()
        })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const resultGrid = data.result;
      const isJackpot = data.isJackpot;

      setTimeout(() => {
        setGrid(resultGrid);
        setIsSpinning(false);
        processResult(resultGrid, isJackpot);
        incrementNonce();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Transaction failed");
      setIsSpinning(false);
    }
  };

  const processResult = (currentGrid: SymbolType[][], isJackpot: boolean) => {
    const betPerLine = parseFloat(betAmount) / 20;
    const { totalWin, winningLines: wins } = SlotsEngine.calculateWin(currentGrid, betPerLine);
    
    let finalWin = totalWin;
    if (isJackpot) {
      finalWin += parseFloat(betAmount) * 100; // Bonus for jackpot segment
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#ffffff', '#f59e0b']
      });
    }

    const usdBet = getTokenValueInUSD(parseFloat(betAmount));
    const usdWin = getTokenValueInUSD(finalWin);

    if (finalWin > 0) {
      setWinAmount(finalWin);
      setWinningLines(wins);
      setBalance(selectedToken.symbol, (parseFloat(balance[selectedToken.symbol]) + finalWin).toFixed(4));
      
      if (finalWin / parseFloat(betAmount) > 10) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#ffffff', '#f59e0b']
        });
      }
    }

    updateStats(usdBet, usdWin);
    addHistory({ 
      game: 'Slots', 
      bet: betAmount, 
      token: selectedToken.symbol,
      multiplier: (finalWin / parseFloat(betAmount)).toFixed(2), 
      win: finalWin.toFixed(4), 
      status: finalWin > 0 ? 'won' : 'lost' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto pt-24 px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Controls */}
      <div className="flex flex-col gap-6">
        <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="text-yellow-500 w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Slot Config</h3>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Bet Amount</label>
                <span className="text-[10px] font-bold text-zinc-400">≈ ${getTokenValueInUSD(parseFloat(betAmount)).toFixed(2)}</span>
              </div>
              <input 
                type="number" 
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 font-mono text-yellow-500 focus:outline-none focus:border-yellow-500/50 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Settings2 className="text-zinc-500 w-4 h-4" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Game Settings</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                  <div className="text-[8px] font-black text-zinc-500 uppercase mb-1">Paylines</div>
                  <div className="text-xs font-black text-white">20 Fixed</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                  <div className="text-[8px] font-black text-zinc-500 uppercase mb-1">RTP</div>
                  <div className="text-xs font-black text-emerald-500">96.0%</div>
                </div>
              </div>
            </div>

            <button 
              onClick={spin}
              disabled={isSpinning}
              className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-black text-xl rounded-2xl transition-all active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
            >
              {isSpinning ? 'SPINNING...' : 'SPIN'}
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-yellow-500 w-4 h-4" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Progressive Jackpot</h3>
          </div>
          <div className="text-2xl font-mono font-black text-white mb-1">
            ${formatCurrency(progressiveJackpotUSD)}
          </div>
          <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            <Flame className="w-3 h-3" />
            <span>GROWING FAST</span>
          </div>
        </div>
      </div>

      {/* Main Slot Area */}
      <div className="lg:col-span-3 flex flex-col gap-8">
        <div className="bg-zinc-900/50 border border-white/10 rounded-[40px] p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.03),transparent)]" />
          
          <div className="grid grid-cols-5 gap-4 relative z-10">
            {grid.map((reel, reelIndex) => (
              <div key={reelIndex} className="space-y-4">
                {reel.map((symbolType, rowIndex) => {
                  const symbol = SYMBOLS.find(s => s.type === symbolType);
                  return (
                    <motion.div
                      key={`${reelIndex}-${rowIndex}-${symbolType}`}
                      initial={isSpinning ? { y: -100, opacity: 0 } : { y: 0, opacity: 1 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: reelIndex * 0.1, type: 'spring', stiffness: 100 }}
                      className={cn(
                        "aspect-square bg-black/40 border border-white/5 rounded-3xl flex items-center justify-center text-5xl shadow-inner relative group",
                        winningLines.some(w => w.lineId && PAYLINES[w.lineId - 1].positions[reelIndex] === rowIndex) && "border-yellow-500/50 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                      )}
                    >
                      <span className={cn(
                        "transition-transform duration-500",
                        isSpinning && "animate-bounce"
                      )}>
                        {symbol?.icon}
                      </span>
                      
                      {winningLines.some(w => w.lineId && PAYLINES[w.lineId - 1].positions[reelIndex] === rowIndex) && (
                        <motion.div 
                          layoutId="win-glow"
                          className="absolute inset-0 rounded-3xl border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>

          <AnimatePresence>
            {winAmount > 0 && !isSpinning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 50 }}
                className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              >
                <div className="bg-yellow-500/20 border border-yellow-500/30 backdrop-blur-2xl rounded-[40px] px-16 py-8 text-center shadow-[0_0_100px_rgba(234,179,8,0.2)]">
                  <div className="text-yellow-500 font-black text-sm uppercase tracking-[0.5em] mb-2">Big Win!</div>
                  <div className="text-6xl font-black text-white tracking-tighter">
                    {winAmount.toFixed(2)} <span className="text-2xl text-yellow-500">{selectedToken.symbol}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-8">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="text-yellow-500 w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Provably Fair</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Target RTP</span>
                <span className="text-[10px] font-black text-emerald-400">96.00%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Paylines</span>
                <span className="text-[10px] font-black text-white">20 ACTIVE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Certification</span>
                <span className="text-[10px] font-black text-white">BASE MAINNET</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-8">
            <div className="flex items-center gap-2 mb-6">
              <Info className="text-zinc-500 w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Symbol Values</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {SYMBOLS.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1 p-3 bg-black/20 rounded-2xl border border-white/5">
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-[10px] font-black text-zinc-500 uppercase">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
