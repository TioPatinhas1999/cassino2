export const BASE_MAINNET_CONFIG = {
  chainId: '0x2105', // 8453
  chainName: 'Base Mainnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
};

export const SUPPORTED_TOKENS = [
  {
    symbol: 'ETH',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
  {
    symbol: 'USDC',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  },
  {
    symbol: 'USDT',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    decimals: 6,
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  },
];

export const CONTRACT_ADDRESSES = {
  VAULT: '0x1234567890123456789012345678901234567890', // Placeholder
  BET_MANAGER: '0x2345678901234567890123456789012345678901', // Placeholder
  GAME_ROUTER: '0x3456789012345678901234567890123456789012', // Placeholder
  RNG_VERIFIER: '0x4567890123456789012345678901234567890123', // Placeholder
};

export const MIN_BET_USD = 10;
export const HOUSE_EDGE = 0.04; // 4%
