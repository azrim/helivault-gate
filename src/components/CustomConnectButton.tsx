import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useBalance } from "wagmi";
import { Button } from "./ui/button";

export const CustomConnectButton = () => {
  const { address } = useBalance();
  const { data: balance } = useBalance({ address: address });

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!connected) {
          return (
            <Button onClick={openConnectModal} type="button">
              Connect Wallet
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Button onClick={openChainModal} type="button" variant="destructive">
              Wrong Network
            </Button>
          );
        }

        return (
          <div
            onClick={openAccountModal}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="px-3 py-2 rounded-md bg-secondary text-foreground font-medium">
              <span>
                {balance?.formatted
                  ? `${parseFloat(balance.formatted).toFixed(3)} ${balance.symbol}`
                  : "Loading..."}
              </span>
            </div>
            <div className="px-3 py-2 rounded-md bg-secondary text-foreground font-medium">
              <span>{account.displayName}</span>
            </div>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
