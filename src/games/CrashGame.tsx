import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Rocket, ShieldCheck, History, Info, Users, Flame } from 'lucide-react';
import { useCasinoStore } from '../store/casinoStore';
import { useWalletStore } from '../store/walletStore';
import { CrashEngine } from '../engine/crashEngine';
import { ProvablyFair } from '../engine/rng';
import { formatCurrency, cn } from '../utils/helpers';
import confetti from 'canvas-confetti';
import { MIN_BET_USD } from '../constants';
import { motion } from 'motion/react';

export const CrashGame = () => {
  const { clientSeed, nonce, incrementNonce, addHistory, updateStats } = useCasinoStore();
  const { address, isConnected, balance, setBalance, selectedToken, ethPrice, placeBetOnChain } = useWalletStore();
  
  const [betAmount, setBetAmount] = useState('10.00');
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'running' | 'crashed'>('idle');
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(0);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashOutMultiplier, setCashOutMultiplier] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const startTimeRef = useRef<number>(0);

  const getTokenValueInUSD = (amount: number) => {
    if (selectedToken.symbol === 'ETH') return amount * ethPrice;
    return amount;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState === 'running') {
        const randomPlayer = {
          id: Math.random().toString(36).substr(2, 5),
          bet: (Math.random() * 100 + 10).toFixed(2),
          cashedOut: Math.random() > 0.9,
          at: multiplier.toFixed(2)
        };
        setPlayers(prev => [randomPlayer, ...prev].slice(0, 10));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, multiplier]);

  const startGame = async () => {
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
    try {
      await placeBetOnChain(betAmount, 'Crash');
      
      setBalance(selectedToken.symbol, (parseFloat(balance[selectedToken.symbol]) - amount).toFixed(4));
      setGameState('waiting');
      setPlayers([]);
      
      // Call Serverless API for result
      const response = await fetch('/api/game/crash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betAmount: amount,
          clientSeed,
          nonce,
          serverSeed: ProvablyFair.generateServerSeed()
        })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setCrashPoint(data.multiplier);
      setHasCashedOut(false);
      setCashOutMultiplier(0);

      setTimeout(() => {
        setGameState('running');
        startTimeRef.current = Date.now();
        requestRef.current = requestAnimationFrame(animate);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Transaction failed");
      setGameState('idle');
    }
  };

  const animate = () => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const currentMultiplier = Math.pow(Math.E, 0.06 * elapsed);
    
    if (currentMultiplier >= crashPoint) {
      setGameState('crashed');
      setMultiplier(crashPoint);
      incrementNonce();
      if (!hasCashedOut) {
        const usdBet = getTokenValueInUSD(parseFloat(betAmount));
        updateStats(usdBet, 0);
        addHistory({ game: 'Crash', bet: betAmount, token: selectedToken.symbol, multiplier: crashPoint.toFixed(2), win: 0, status: 'lost' });
      }
      return;
    }

    setMultiplier(currentMultiplier);
    drawGraph(currentMultiplier);
    requestRef.current = requestAnimationFrame(animate);
  };

  const cashOut = () => {
    if (gameState !== 'running' || hasCashedOut) return;
    
    if (multiplier >= crashPoint) return;
    
    setHasCashedOut(true);
    setCashOutMultiplier(multiplier);
    const amount = parseFloat(betAmount);
    const winAmount = amount * multiplier;
    const usdBet = getTokenValueInUSD(amount);
    const usdWin = getTokenValueInUSD(winAmount);

    setBalance(selectedToken.symbol, (parseFloat(balance[selectedToken.symbol]) + winAmount).toFixed(4));
    updateStats(usdBet, usdWin);
    addHistory({ game: 'Crash', bet: betAmount, token: selectedToken.symbol, multiplier: multiplier.toFixed(2), win: winAmount.toFixed(4), status: 'won' });
    incrementNonce();
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#16a34a', '#15803d']
    });
  };

  const drawGraph = (m: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(i * (canvas.width / 10), 0);
      ctx.lineTo(i * (canvas.width / 10), canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * (canvas.height / 10));
      ctx.lineTo(canvas.width, i * (canvas.height / 10));
      ctx.stroke();
    }

    // Draw curve
    ctx.beginPath();
    ctx.strokeStyle = gameState === 'crashed' ? '#ef4444' : '#fbbf24';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const points = 100;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    
    for (let i = 0; i <= points; i++) {
      const t = (elapsed * i) / points;
      const val = Math.pow(Math.E, 0.06 * t);
      const x = (i / points) * (canvas.width * 0.8);
      const y = canvas.height - (val - 1) * (canvas.height / 10);
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = gameState === 'crashed' ? '#ef4444' : '#fbbf24';
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  return (
    <div className="max-w-7xl mx-auto pt-24 px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar: Controls & Players */}
      <div className="flex flex-col gap-6">
        <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Rocket className="text-yellow-500 w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Place Bet</h3>
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
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Amount ({selectedToken.symbol})</label>
                <span className="text-[10px] font-bold text-zinc-400">≈ ${getTokenValueInUSD(parseFloat(betAmount)).toFixed(2)}</span>
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 font-mono text-yellow-500 focus:outline-none focus:border-yellow-500/50 transition-all"
                />
                <button 
                  onClick={() => setBetAmount((parseFloat(balance[selectedToken.symbol]) / 2).toFixed(4))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black text-zinc-400"
                >
                  1/2
                </button>
              </div>
            </div>

            {gameState === 'running' && !hasCashedOut ? (
              <button 
                onClick={cashOut}
                className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl rounded-2xl transition-all active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
              >
                CASH OUT
              </button>
            ) : (
              <button 
                onClick={startGame}
                disabled={gameState === 'waiting' || gameState === 'running'}
                className="w-full py-5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-black text-xl rounded-2xl transition-all active:scale-95 border border-white/5"
              >
                {gameState === 'waiting' ? 'WAITING...' : 'BET'}
              </button>
            )}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-8 shadow-2xl flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="text-zinc-500 w-4 h-4" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Live Players</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-400">{players.length + 1240} Online</span>
          </div>

          <div className="space-y-3">
            {players.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-zinc-500">Player {p.id}</span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-300">{p.bet} {selectedToken.symbol}</span>
                  {p.cashedOut ? (
                    <span className="text-emerald-400">{p.at}x</span>
                  ) : (
                    <span className="text-zinc-600">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="lg:col-span-3 flex flex-col gap-8">
        <div className="relative bg-zinc-900/50 border border-white/10 rounded-[40px] p-12 overflow-hidden shadow-2xl aspect-video flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.05),transparent)]" />
          
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={500} 
            className="absolute inset-0 w-full h-full"
          />

          <div className="relative z-10 text-center">
            <motion.div
              key={multiplier}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={cn(
                "text-9xl font-black tracking-tighter mb-4 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]",
                gameState === 'crashed' ? "text-red-500" : "text-white"
              )}
            >
              {multiplier.toFixed(2)}x
            </motion.div>
            
            {gameState === 'crashed' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-black text-red-500 uppercase tracking-[0.3em]"
              >
                CRASHED!
              </motion.div>
            )}

            {hasCashedOut && gameState === 'running' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl rounded-3xl px-8 py-4"
              >
                <div className="text-emerald-400 font-black text-2xl">CASHED OUT!</div>
                <div className="text-white font-mono text-xl">@{cashOutMultiplier.toFixed(2)}x</div>
              </motion.div>
            )}
          </div>

          <div className="absolute bottom-8 left-8 flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">
              <ShieldCheck className="w-4 h-4 text-yellow-500" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Provably Fair</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-8">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="text-orange-500 w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Hot Multipliers</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {[1.45, 12.4, 2.1, 1.05, 4.2].map((m, i) => (
                <div key={i} className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black border",
                  m > 2 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                  {m.toFixed(2)}x
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-zinc-900/50 border border-white/10 rounded-[32px] p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Info className="text-zinc-500 w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Game Info</h3>
              </div>
              <span className="text-[10px] font-bold text-zinc-500">Target RTP: 96.00%</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
              Crash is a real-time multiplayer game. The multiplier starts at 1.00x and grows exponentially. 
              Cash out before the rocket crashes to win your bet multiplied by the current value.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
