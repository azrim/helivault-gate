import { ConnectButton } from "@rainbow-me/rainbowkit";

export const CustomConnectButton = () => {
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

        // Determine the text for the status indicator
        const statusText = !connected
          ? "Not Connected"
          : chain.unsupported
            ? "Wrong Network"
            : "Connected";

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
            // The outer pill container
            className="flex items-center justify-between p-1 space-x-2 rounded-full border border-border/40 bg-secondary/60"
          >
            {/* Left Side: Plain text status indicator */}
            <span className="pl-3 pr-1 text-sm font-medium text-muted-foreground">
              {statusText}
            </span>

            {/* Right Side: The smaller, gradient action button */}
            <button
              onClick={() => {
                if (!connected) {
                  openConnectModal();
                } else if (chain.unsupported) {
                  openChainModal();
                } else {
                  openAccountModal();
                }
              }}
              type="button"
              className="px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition-opacity"
            >
              {(() => {
                if (!connected) {
                  return "Connect Wallet";
                }
                if (chain.unsupported) {
                  return "Switch Network";
                }
                return account.displayName;
              })()}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
