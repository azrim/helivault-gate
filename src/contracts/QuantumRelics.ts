// src/contracts/QuantumRelics.ts

export const QUANTUM_RELICS_CONTRACT = {
  address: "0x0d4ae987f48D0f7ADCa60c233F7876589beed8B0",
  abi: [
    {
      "inputs": [
        { "internalType": "address", "name": "_hlvTokenAddress", "type": "address" },
        { "internalType": "address", "name": "_royaltyReceiver", "type": "address" },
        { "internalType": "uint96", "name": "_royaltyFeeNumerator", "type": "uint96" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "quantity", "type": "uint256" }],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "currentSupply",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MAX_SUPPLY",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MINT_PRICE",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "owner", "type": "address" },
        { "internalType": "uint256", "name": "index", "type": "uint256" }
      ],
      "name": "tokenOfOwnerByIndex",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    }
  ],
} as const;