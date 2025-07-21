// src/contracts/HelivaultToken.ts
import { heliosTestnet } from "@/lib/chains";
import HelivaultTokenAbi from "./HelivaultToken.json";

export const HELIVAULT_TOKEN_CONTRACT = {
  address: "0x4f1D4359270f41F4bC9097169083c267d898459a" as `0x${string}`,
  abi: HelivaultTokenAbi.abi as const,
  chain: heliosTestnet,
};
