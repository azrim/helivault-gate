// src/config/reown.ts
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { heliosTestnet } from "@/lib/chains";
import { AppKitNetwork } from "@reown/appkit/networks";

export const projectId = "b4a5bd4206fe36062ef6a8f389565fd2";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const toAppKitNetwork = (chain: any): AppKitNetwork => ({
  id: chain.id,
  name: chain.name,
  chainNamespace: "eip155",
  caipNetworkId: `eip155:${chain.id}`,
  nativeCurrency: { ...chain.nativeCurrency },
  rpcUrls: { ...chain.rpcUrls },
  blockExplorers: { ...chain.blockExplorers },
});

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  toAppKitNetwork(heliosTestnet),
];

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;