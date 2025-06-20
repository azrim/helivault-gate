import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { web3Service } from "@/services/web3Service";
import type { ContractData } from "@/contracts/HelivaultNFT";

// Helios Chain Testnet Configuration
const HELIOS_NETWORK = {
  chainId: "0xa410", // 42000 in hex
  chainName: "Helios Chain Testnet",
  nativeCurrency: {
    name: "Helios",
    symbol: "HLS",
    decimals: 18,
  },
  rpcUrls: ["https://testnet1.helioschainlabs.org"],
  blockExplorerUrls: ["https://explorer.helioschainlabs.org"],
  iconUrls: ["helioschain"],
};

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  balance: string;
  networkName: string;
  isCorrectNetwork: boolean;
  switchToHelios: () => Promise<void>;
  contractData: ContractData | null;
  refreshContractData: () => Promise<void>;
  mintNFT: () => Promise<{ hash: string; success: boolean }>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState("0.00");
  const [networkName, setNetworkName] = useState("Unknown");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [contractData, setContractData] = useState<ContractData | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
      }
    };
  }, []);

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          await checkNetwork();
          await getBalance(accounts[0]);
          setTimeout(refreshContractData, 1000);
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAddress(accounts[0]);
      setIsConnected(true);
      checkNetwork();
      getBalance(accounts[0]);
      setTimeout(refreshContractData, 1000);
    }
  };

  const checkNetwork = async () => {
    try {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        if (chainId === HELIOS_NETWORK.chainId) {
          setNetworkName("Helios Chain Testnet");
          setIsCorrectNetwork(true);
        } else {
          setNetworkName("Wrong Network");
          setIsCorrectNetwork(false);
        }
      }
    } catch (error) {
      console.error("Error checking network:", error);
      setNetworkName("Unknown");
      setIsCorrectNetwork(false);
    }
  };

  const getBalance = async (address: string) => {
    try {
      if (window.ethereum) {
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        });
        // Convert from wei to HLS
        const hlsBalance = parseInt(balance, 16) / Math.pow(10, 18);
        setBalance(hlsBalance.toFixed(4));
      }
    } catch (error) {
      console.error("Error getting balance:", error);
      setBalance("0.00");
    }
  };

  const refreshContractData = async () => {
    try {
      if (isCorrectNetwork) {
        const data = await web3Service.getContractData(address || undefined);
        setContractData(data);
      }
    } catch (error) {
      console.error("Error fetching contract data:", error);
    }
  };

  const mintNFT = async (): Promise<{ hash: string; success: boolean }> => {
    if (!address || !isCorrectNetwork) {
      throw new Error("Wallet not connected or wrong network");
    }

    try {
      const result = await web3Service.mintNFT(address);
      // Refresh contract data after successful mint
      setTimeout(refreshContractData, 2000);
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Minting failed");
    }
  };

  const switchToHelios = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      // Try to switch to Helios network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HELIOS_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      // Network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [HELIOS_NETWORK],
          });
        } catch (addError) {
          console.error("Error adding Helios network:", addError);
          alert("Failed to add Helios network. Please add it manually.");
        }
      } else {
        console.error("Error switching to Helios network:", switchError);
        alert("Failed to switch to Helios network.");
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet!");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);

        // Check network and switch to Helios if needed
        await checkNetwork();
        if (!isCorrectNetwork) {
          await switchToHelios();
          await checkNetwork();
        }

        await getBalance(accounts[0]);
        setTimeout(refreshContractData, 1000);
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      if (error.code === 4001) {
        alert("Please connect to MetaMask.");
      } else {
        alert("An error occurred while connecting to the wallet.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance("0.00");
    setNetworkName("Unknown");
    setIsCorrectNetwork(false);
    setContractData(null);
  };

  const value: WalletContextType = {
    isConnected,
    address,
    isConnecting,
    connectWallet,
    disconnectWallet,
    balance,
    networkName,
    isCorrectNetwork,
    switchToHelios,
    contractData,
    refreshContractData,
    mintNFT,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
