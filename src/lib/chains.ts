// src/lib/chains.ts
import { type Chain } from 'viem';

export const heliosTestnet = {
  id: 42000,
  name: 'Helios Chain Testnet',
  nativeCurrency: { name: 'Helios', symbol: 'HLS', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet1.helioschainlabs.org'] },
    public: { http: ['https://testnet1.helioschainlabs.org'] },
  },
  blockExplorers: {
    default: { name: 'Helios Explorer', url: 'https://explorer.helioschainlabs.org' },
  },
} as const satisfies Chain;