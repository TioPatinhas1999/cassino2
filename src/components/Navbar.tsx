import React, { useState, useEffect } from 'react';
import { useWalletStore } from '../store/walletStore';
import { Wallet, LogOut, ChevronDown, ShieldCheck, AlertCircle, Coins, Activity } from 'lucide-react';
import { cn, formatAddress, formatCurrency } from '../utils/helpers';
import { BASE_MAINNET_CONFIG, SUPPORTED_TOKENS } from '../constants';

export const Navbar = () => {
  const { 
    address, balance, selectedToken, isConnected, isConnecting, chainId,
    connect, disconnect, setSelectedToken
  } = useWalletStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTokenSelect, setShowTokenSelect] = useState(false);

  const isWrongNetwork = chainId && chainId !== BASE_MAINNET_CONFIG.chainId;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 h-20 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-yellow-600 to-yellow-700 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            <Coins className="text-black w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 tracking-tighter leading-none">
              CASSINOWEB3
            </span>
            <span className="text-[8px] font-bold text-yellow-500/60 tracking-[0.3em] uppercase">Premium Experience</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {['GAMES', 'PROMOTIONS', 'VIP', 'FAIRNESS'].map((item) => (
            <button 
              key={item}
              className="px-4 py-2 text-[11px] font-black tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isConnected && isWrongNetwork && (
          <button 
            onClick={connect}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-2xl text-xs font-bold hover:bg-red-500/20 transition-all"
          >
            <AlertCircle className="w-4 h-4" />
            Switch to Base
          </button>
        )}

        {isConnected ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowTokenSelect(!showTokenSelect)}
                className="bg-zinc-900/80 border border-white/5 rounded-2xl px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-800 transition-all"
              >
                <img 
                  src={selectedToken.icon} 
                  className="w-5 h-5 rounded-full" 
                  alt={selectedToken.symbol}
                />
                <div className="text-left">
                  <div className="text-[10px] font-black text-zinc-500 leading-none mb-1 uppercase tracking-widest">Balance</div>
                  <div className="text-sm font-mono font-black leading-none">
                    {balance[selectedToken.symbol] || '0.00'} {selectedToken.symbol}
                  </div>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-zinc-600 transition-transform", showTokenSelect && "rotate-180")} />
              </button>

              {showTokenSelect && (
                <div className="absolute top-full mt-2 right-0 w-56 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2">
                  {SUPPORTED_TOKENS.map(token => (
                    <button
                      key={token.symbol}
                      onClick={() => { setSelectedToken(token); setShowTokenSelect(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all"
                    >
                      <img src={token.icon} className="w-6 h-6 rounded-full" alt={token.symbol} />
                      <div className="text-left">
                        <div className="text-xs font-bold text-white">{token.symbol}</div>
                        <div className="text-[10px] text-zinc-500 font-bold">
                          {balance[token.symbol] || '0.00'} Available
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors rounded-2xl px-4 py-2.5 border border-yellow-500/20"
              >
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-sm font-mono font-black text-yellow-500">{formatAddress(address!)}</span>
                <ChevronDown className={cn("w-4 h-4 text-yellow-500 transition-transform", showDropdown && "rotate-180")} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Network</div>
                    <div className="text-xs font-bold text-emerald-400">Base Mainnet</div>
                  </div>
                  <button 
                    onClick={() => { disconnect(); setShowDropdown(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-black px-6 py-3 rounded-2xl transition-all active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
          >
            <Wallet className="w-5 h-5" />
            {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
          </button>
        )}
      </div>
    </nav>
  );
};
