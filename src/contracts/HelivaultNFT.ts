// src/contracts/HelivaultNFT.ts

export const HELIVAULT_CYPHERS_CONTRACT = {
  address: "0x7E8E1081767bB8BdBF54323a93C9C36Dfd7073cF",
  abi: [
    {
      "inputs": [
        { "internalType": "string", "name": "baseURI_", "type": "string" },
        { "internalType": "string", "name": "hiddenURI_", "type": "string" },
        { "internalType": "uint96", "name": "royaltyBips", "type": "uint96" },
        { "internalType": "uint256", "name": "maxSupply_", "type": "uint256" },
        { "internalType": "uint256", "name": "initialMintPrice_", "type": "uint256" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "quantity", "type": "uint256" }],
      "name": "mint",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "maxSupply",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "mintPrice",
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
    // --- FIX: Added the missing owner function to the ABI ---
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    }
  ],
} as const;