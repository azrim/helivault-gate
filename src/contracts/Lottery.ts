// src/contracts/Lottery.ts
import { heliosTestnet } from "@/lib/chains";

export const LOTTERY_CONTRACT = {
  address: "0x263C021146a5f539B16A83feA26B0EA883A7336a",
  abi: [
    {
      inputs: [{ internalType: "uint256", name: "_entryPrice", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [{ internalType: "address", name: "owner", type: "address" }],
      name: "OwnableInvalidOwner",
      type: "error",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "OwnableUnauthorizedAccount",
      type: "error",
    },
    { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
        { indexed: true, internalType: "address", name: "newOwner", type: "address" },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "address", name: "winner", type: "address" },
        { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "WinnerPaid",
      type: "event",
    },
    { inputs: [], name: "enter", outputs: [], stateMutability: "payable", type: "function" },
    {
      inputs: [],
      name: "entryPrice",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    { inputs: [], name: "fund", outputs: [], stateMutability: "payable", type: "function" },
    {
      inputs: [],
      name: "lastWinner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "lastWinnerAmount",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    { inputs: [], name: "renounceOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
    {
      inputs: [{ internalType: "uint256", name: "_newPrice", type: "uint256" }],
      name: "setEntryPrice",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    { inputs: [], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
    { stateMutability: "payable", type: "receive" },
  ],
  chain: heliosTestnet,
} as const;