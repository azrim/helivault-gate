// src/contracts/HelivaultToken.ts
import { heliosTestnet } from "@/lib/chains";
import HelivaultTokenAbi from "./HelivaultToken.json";

export const HELIVAULT_TOKEN_CONTRACT = {
  address: "0xd77D39A526c1ad181827E1Dae918566dD7CAd9d5" as `0x${string}`,
  abi: HelivaultTokenAbi.abi,
  chain: heliosTestnet,
} as const;
