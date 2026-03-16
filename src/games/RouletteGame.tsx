import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Info, History, Coins, Zap } from 'lucide-react';
import { useCasinoStore } from '../store/casinoStore';
import { useWalletStore } from '../store/walletStore';
import { RouletteEngine } from '../engine/rouletteEngine';
import { ProvablyFair } from '../engine/rng';
import { formatCurrency, cn } from '../utils/helpers';
import confetti from 'canvas-confetti';
import { MIN_BET_USD } from '../constants';

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const RouletteGame = () => {
  const { clientSeed, nonce, incrementNonce, addHistory, updateStats } = useCasinoStore();
  const { address, isConnected, balance, setBalance, selectedToken, ethPrice, placeBetOnChain } = useWalletStore();
  
  const [betAmount, setBetAmount] = useState('10.00');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const getTokenValueInUSD = (amount: number) => {
    if (selectedToken.symbol === 'ETH') return amount * ethPrice;
    return amount;
  };

  const toggleNumber = (num: number) => {
    if (isSpinning) return;
    setSelectedNumbers(prev => 
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  const spin = async () => {
    const amount = parseFloat(betAmount);
    const totalBet = amount * selectedNumbers.length;
    const usdValue = getTokenValueInUSD(totalBet);

    if (!isConnected) {
      setError("Please connect your wallet first.");
      return;
    }

    if (selectedNumbers.length === 0) {
      setError("Please select at least one number.");
      return;
    }

    if (usdValue < MIN_BET_USD) {
      setError(`Minimum bet is $${MIN_BET_USD} USD equivalent`);
      return;
    }

    if (totalBet > parseFloat(balance[selectedToken.symbol])) {
      setError("Insufficient balance.");
      return;
    }
    
    setError(null);
    try {
      await placeBetOnChain(totalBet.toString(), 'Roulette');
      
      setBalance(selectedToken.symbol, (parseFloat(balance[selectedToken.symbol]) - totalBet).toFixed(4));
      setIsSpinning(true);
      setResult(null);

      // Call Serverless API for result
      const response = await fetch('/api/game/roulette', {
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
      const winningNumber = data.result;

      // Animation logic
      const extraSpins = 5 + Math.random() * 5;
      const targetRotation = rotation + (extraSpins * 360) + (winningNumber * (360 / 37));
      setRotation(targetRotation);

      setTimeout(() => {
        setResult(winningNumber);
        setIsSpinning(false);
        calculateWin(winningNumber, totalBet);
        incrementNonce();
      }, 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Transaction failed");
      setIsSpinning(false);
    }
  };

  const calculateWin = (winningNumber: number, totalBet: number) => {
    const isWin = selectedNumbers.includes(winningNumber);
    const amount = parseFloat(betAmount);
    const winAmount = isWin ? amount * 36 : 0;
    const usdBet = getTokenValueInUSD(totalBet);
    const usdWin = getTokenValueInUSD(winAmount);

    if (isWin) {
      setBalance(selectedToken.symbol, (parseFloat(balance[selectedToken.symbol]) + winAmount).toFixed(4));
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#16a34a', '#15803d']
      });
    }

    updateStats(usdBet, usdWin);
    addHistory({ 
      game: 'Roulette', 
      bet: totalBet.toFixed(4), 
      token: selectedToken.symbol,
      multiplier: isWin ? '36.00' : '0.00', 
      win: winAmount.toFixed(4), 
      status: isWin ? 'won' : 'lost' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto pt-24 px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Controls */}
      <div className="flex flex-col gap-6">
        <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Coins className="text-yellow-500 w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Betting</h3>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold">
                <Info className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Per Number</label>
                <span className="text-[10px] font-bold text-zinc-400">≈ ${getTokenValueInUSD(parseFloat(betAmount)).toFixed(2)}</span>
              </div>
              <input 
                type="number" 
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 font-mono text-yellow-500 focus:outline-none focus:border-yellow-500/50 transition-all"
              />
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                <span>Total Bet</span>
                <span className="text-white">{(parseFloat(betAmount) * selectedNumbers.length).toFixed(4)} {selectedToken}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <span>USD Value</span>
                <span className="text-yellow-500">${getTokenValueInUSD(parseFloat(betAmount) * selectedNumbers.length).toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={spin}
              disabled={isSpinning || selectedNumbers.length === 0}
              className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-black text-xl rounded-2xl transition-all active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
            >
              {isSpinning ? 'SPINNING...' : 'PLACE BETS'}
            </button>

            <button 
              onClick={() => setSelectedNumbers([])}
              disabled={isSpinning}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-zinc-400 font-black text-xs rounded-xl transition-all uppercase tracking-widest"
            >
              Clear Table
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <History className="text-zinc-500 w-4 h-4" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Recent Results</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[32, 15, 19, 4, 21].map((n, i) => (
              <div key={i} className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border",
                n === 0 ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
                RED_NUMBERS.includes(n) ? "bg-red-500/20 border-red-500/30 text-red-400" :
                "bg-zinc-800 border-white/10 text-white"
              )}>
                {n}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="lg:col-span-3 flex flex-col gap-8">
        <div className="bg-zinc-900/50 border border-white/10 rounded-[40px] p-12 shadow-2xl relative overflow-hidden flex flex-col items-center gap-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.03),transparent)]" />
          
          {/* Wheel Visualization */}
          <div className="relative w-64 h-64">
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full rounded-full border-8 border-zinc-800 shadow-2xl relative overflow-hidden bg-zinc-900"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] z-20" />
              </div>
              {/* Simplified wheel segments */}
              {Array.from({ length: 37 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full origin-bottom"
                  style={{ transform: `rotate(${(i * 360) / 37}deg)` }}
                >
                  <div className={cn(
                    "w-full h-8",
                    i === 0 ? "bg-emerald-500" : RED_NUMBERS.includes(i) ? "bg-red-500" : "bg-zinc-800"
                  )} />
                </div>
              ))}
            </motion.div>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-8 bg-yellow-500 rounded-full z-30 shadow-lg" />
          </div>

          {/* Betting Table */}
          <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[800px] grid grid-cols-13 gap-1">
              {/* Zero */}
              <button
                onClick={() => toggleNumber(0)}
                className={cn(
                  "row-span-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-xl font-black text-emerald-400 hover:bg-emerald-500/20 transition-all",
                  selectedNumbers.includes(0) && "bg-emerald-500 text-black border-emerald-500"
                )}
              >
                0
              </button>
              
              {/* Numbers 1-36 */}
              {Array.from({ length: 36 }).map((_, i) => {
                const num = i + 1;
                const isRed = RED_NUMBERS.includes(num);
                return (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    className={cn(
                      "aspect-square rounded-xl border flex items-center justify-center text-sm font-black transition-all",
                      isRed ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" : "bg-zinc-800 border-white/5 text-white hover:bg-zinc-700",
                      selectedNumbers.includes(num) && (isRed ? "bg-red-500 text-white border-red-500" : "bg-white text-black border-white")
                    )}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {result !== null && !isSpinning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40"
              >
                <div className={cn(
                  "w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 shadow-2xl backdrop-blur-xl",
                  result === 0 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                  RED_NUMBERS.includes(result) ? "bg-red-500/20 border-red-500 text-red-400" :
                  "bg-white/10 border-white text-white"
                )}>
                  <div className="text-xs font-black uppercase tracking-widest mb-1">Result</div>
                  <div className="text-5xl font-black">{result}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-8">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-yellow-500 w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Provably Fair</h3>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
              European Roulette with 37 pockets. House edge is 2.70%. Results are generated using HMAC-SHA512.
            </p>
          </div>

          <div className="md:col-span-2 bg-zinc-900/50 border border-white/10 rounded-[32px] p-8">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-yellow-500 w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Quick Stats</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-zinc-500 text-[10px] font-black uppercase mb-1">Red/Black</div>
                <div className="text-white font-mono font-black">1.94x</div>
              </div>
              <div className="text-center">
                <div className="text-zinc-500 text-[10px] font-black uppercase mb-1">Straight Up</div>
                <div className="text-white font-mono font-black">36.00x</div>
              </div>
              <div className="text-center">
                <div className="text-zinc-500 text-[10px] font-black uppercase mb-1">Dozens</div>
                <div className="text-white font-mono font-black">3.00x</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
