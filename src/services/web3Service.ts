import {
  HELIVAULT_NFT_CONTRACT,
  type ContractData,
} from "@/contracts/HelivaultNFT";

export class Web3Service {
  public contract: any;
  private provider: any;

  constructor() {
    if (window.ethereum) {
      this.provider = window.ethereum;
    }
  }

  private getContract() {
    if (!this.provider) {
      throw new Error("No Web3 provider found");
    }

    // Create contract instance
    return {
      address: HELIVAULT_NFT_CONTRACT.address,
      abi: HELIVAULT_NFT_CONTRACT.abi,
    };
  }

  async getContractData(userAddress?: string): Promise<ContractData> {
    try {
      if (!this.provider) {
        throw new Error("No Web3 provider available");
      }

      console.log("Fetching contract data...");
      const contract = this.getContract();

      // Get contract data using simplified eth_call with hardcoded function signatures
      const calls = [
        this.simpleContractCall("totalSupply()", "0x18160ddd"), // totalSupply()
        this.simpleContractCall("maxSupply()", "0xd5abeb01"), // maxSupply()
        this.simpleContractCall("mintPrice()", "0x6817c76c"), // mintPrice()
        this.simpleContractCall("revealed()", "0x51830227"), // revealed()
      ];

      if (userAddress) {
        calls.push(
          this.simpleContractCall(
            "balanceOf(address)",
            "0x70a08231",
            userAddress,
          ),
        );
      }

      const results = await Promise.allSettled(calls);

      console.log("Contract call results:", results);

      // Parse results with fallbacks
      const currentSupply =
        results[0].status === "fulfilled"
          ? parseInt(results[0].value, 16) || 0
          : 0;
      const maxSupply =
        results[1].status === "fulfilled"
          ? parseInt(results[1].value, 16) || 1000
          : 1000;
      const mintPrice =
        results[2].status === "fulfilled"
          ? this.formatEther(results[2].value)
          : "0.01";
      const isRevealed =
        results[3].status === "fulfilled"
          ? results[3].value ===
            "0x0000000000000000000000000000000000000000000000000000000000000001"
          : false;
      const userBalance =
        userAddress && results[4] && results[4].status === "fulfilled"
          ? parseInt(results[4].value, 16) || 0
          : 0;

      console.log("Parsed contract data:", {
        currentSupply,
        maxSupply,
        mintPrice,
        userBalance,
        isRevealed,
      });

      return {
        currentSupply,
        maxSupply,
        mintPrice,
        userBalance,
        isRevealed,
      };
    } catch (error: any) {
      console.error("Error fetching contract data:", {
        message: error.message,
        stack: error.stack,
        error: error,
      });

      // Return fallback data
      return {
        currentSupply: 0,
        maxSupply: 1000,
        mintPrice: "0.01",
        userBalance: 0,
        isRevealed: false,
      };
    }
  }

  private async simpleContractCall(
    methodName: string,
    functionSelector: string,
    address?: string,
  ): Promise<string> {
    const contract = this.getContract();

    let data = functionSelector;

    // Add address parameter if provided (for balanceOf)
    if (address && methodName.includes("address")) {
      // Remove 0x prefix and pad to 32 bytes
      const cleanAddress = address.replace("0x", "");
      data += "000000000000000000000000" + cleanAddress.toLowerCase();
    }

    console.log(`Calling ${methodName} with data:`, data);

    const result = await this.provider.request({
      method: "eth_call",
      params: [
        {
          to: contract.address,
          data: data,
        },
        "latest",
      ],
    });

    console.log(`Result for ${methodName}:`, result);
    return result;
  }

  // Removed complex encoding methods - using hardcoded function selectors instead

  private formatEther(wei: string): string {
    const weiValue = parseInt(wei, 16);
    const etherValue = weiValue / Math.pow(10, 18);
    return etherValue.toFixed(4);
  }

  async mintNFT(
    userAddress: string,
  ): Promise<{ hash: string; success: boolean }> {
    try {
      if (!this.provider) {
        throw new Error("No Web3 provider available");
      }

      const contract = this.getContract();
      const mintPriceWei = "0x2386F26FC10000"; // 0.01 ether in wei

      console.log("Sending mint transaction...", {
        from: userAddress,
        to: contract.address,
        value: mintPriceWei,
        data: "0x1249c58b",
      });

      const txHash = await this.provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: userAddress,
            to: contract.address,
            value: mintPriceWei,
            data: "0x1249c58b", // mint() function signature
            //gas: "0x5208", // 21000 in hex (basic gas limit)
          },
        ],
      });

      console.log("Transaction sent:", txHash);
      return { hash: txHash, success: true };
    } catch (error: any) {
      console.error("Minting error:", {
        message: error.message,
        code: error.code,
        data: error.data,
        error: error,
      });

      // Handle specific error cases
      if (error.code === 4001) {
        throw new Error("Transaction rejected by user");
      } else if (error.code === -32603) {
        throw new Error(
          "Internal JSON-RPC error. Please check your wallet and try again.",
        );
      } else {
        throw new Error(error.message || "Minting transaction failed");
      }
    }
  }

  async waitForTransaction(hash: string): Promise<any> {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    while (attempts < maxAttempts) {
      try {
        const receipt = await this.provider.request({
          method: "eth_getTransactionReceipt",
          params: [hash],
        });

        if (receipt) {
          return receipt;
        }
      } catch (error) {
        console.error("Error checking transaction:", error);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;
    }

    throw new Error("Transaction timeout");
  }
}

export const web3Service = new Web3Service();
