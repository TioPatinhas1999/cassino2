import { create } from 'zustand';
import { ethers } from 'ethers';
import { BASE_MAINNET_CONFIG, SUPPORTED_TOKENS } from '../constants';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletState {
  address: string | null;
  balance: Record<string, string>;
  selectedToken: typeof SUPPORTED_TOKENS[0];
  ethPrice: number;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: string | null;
  
  connect: () => Promise<void>;
  disconnect: () => void;
  setBalance: (token: string, amount: string) => void;
  setSelectedToken: (token: typeof SUPPORTED_TOKENS[0]) => void;
  setEthPrice: (price: number) => void;
  placeBetOnChain: (amount: string, gameType: string) => Promise<string>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  balance: {
    ETH: '1.50',
    USDT: '1000.00',
    USDC: '1000.00',
  },
  selectedToken: SUPPORTED_TOKENS[2],
  ethPrice: 2500,
  isConnected: false,
  isConnecting: false,
  chainId: null,

  connect: async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another EVM wallet.');
      return;
    }

    set({ isConnecting: true });
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const targetChainId = parseInt(BASE_MAINNET_CONFIG.chainId, 16);
      
      if (Number(network.chainId) !== targetChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_MAINNET_CONFIG.chainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [BASE_MAINNET_CONFIG],
            });
          } else {
            throw switchError;
          }
        }
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      set({ address: accounts[0], isConnected: true, isConnecting: false, chainId: BASE_MAINNET_CONFIG.chainId });
    } catch (error) {
      console.error('Connection error:', error);
      set({ isConnecting: false });
    }
  },

  disconnect: () => set({ address: null, isConnected: false }),
  setBalance: (token, amount) => set((state) => ({ balance: { ...state.balance, [token]: amount } })),
  setSelectedToken: (selectedToken) => set({ selectedToken }),
  setEthPrice: (ethPrice) => set({ ethPrice }),
  
  placeBetOnChain: async (amount: string, gameType: string) => {
    const { address, isConnected, selectedToken } = get();
    if (!isConnected || !address) throw new Error("Wallet not connected");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const message = `Betting ${amount} ${selectedToken.symbol} on ${gameType} at ${new Date().toISOString()}`;
    const signature = await signer.signMessage(message);
    
    console.log("Bet signed:", signature);
    return signature;
  },
}));
