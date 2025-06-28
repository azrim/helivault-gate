// src/lib/chains.ts
import { type Chain } from 'viem';

export const heliosTestnet = {
  id: 42000,
  name: 'Helios Testnet',
  nativeCurrency: { name: 'Helios', symbol: 'HLS', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet1.helioschainlabs.org'] },
  },
  blockExplorers: {
    default: { name: 'Helios Explorer', url: 'https://explorer.helioschainlabs.org' },
  },
} as const satisfies Chain;

export const sepolia = {
    id: 11155111,
    name: 'Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.sepolia.org'] },
    },
    blockExplorers: {
        default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    },
    testnet: true,
} as const satisfies Chain;

export const bscTestnet = {
    id: 97,
    name: 'BSC Testnet',
    nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545'] },
    },
    blockExplorers: {
        default: { name: 'BscScan', url: 'https://testnet.bscscan.com' },
    },
    testnet: true,
} as const satisfies Chain;

export const avalancheFuji = {
    id: 43113,
    name: 'Avalanche Fuji',
    nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] },
    },
    blockExplorers: {
        default: { name: 'Snowtrace', url: 'https://testnet.snowtrace.io' },
    },
    testnet: true,
} as const satisfies Chain;