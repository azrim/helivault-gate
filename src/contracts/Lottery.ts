// src/contracts/Lottery.ts
import deployments from '../../contracts/deployments.json';
import Lottery from '../../contracts/artifacts/contracts/Lottery.sol/Lottery.json';
import { heliosTestnet } from '@/lib/chains';

const lotteryAddress = deployments.Lottery.address as `0x${string}`;

export const LOTTERY_CONTRACT = {
  address: lotteryAddress,
  abi: Lottery.abi,
  chain: heliosTestnet,
};
