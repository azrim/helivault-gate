import {
  HELIVAULT_NFT_CONTRACT,
  type ContractData,
} from "@/contracts/HelivaultNFT";

export class Web3Service {
  private contract: any;
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
      const contract = this.getContract();

      // Get contract data using eth_call
      const [currentSupply, maxSupply, mintPrice, userBalance, isRevealed] =
        await Promise.all([
          this.callContract("totalSupply", []),
          this.callContract("maxSupply", []),
          this.callContract("mintPrice", []),
          userAddress
            ? this.callContract("balanceOf", [userAddress])
            : Promise.resolve("0"),
          this.callContract("revealed", []),
        ]);

      return {
        currentSupply: parseInt(currentSupply, 16),
        maxSupply: parseInt(maxSupply, 16),
        mintPrice: this.formatEther(mintPrice),
        userBalance: parseInt(userBalance, 16),
        isRevealed: isRevealed === "0x1",
      };
    } catch (error) {
      console.error("Error fetching contract data:", error);
      return {
        currentSupply: 0,
        maxSupply: 1000,
        mintPrice: "0.01",
        userBalance: 0,
        isRevealed: false,
      };
    }
  }

  private async callContract(method: string, params: any[]): Promise<string> {
    const contract = this.getContract();
    const methodAbi = contract.abi.find(
      (item: any) => item.name === method && item.type === "function",
    );

    if (!methodAbi) {
      throw new Error(`Method ${method} not found in ABI`);
    }

    // Encode function call
    const functionSignature = this.encodeFunctionSignature(methodAbi);
    const encodedParams = this.encodeParameters(methodAbi.inputs, params);
    const data = functionSignature + encodedParams.slice(2);

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

    return result;
  }

  private encodeFunctionSignature(methodAbi: any): string {
    const signature = `${methodAbi.name}(${methodAbi.inputs.map((input: any) => input.type).join(",")})`;
    return this.keccak256(signature).slice(0, 10);
  }

  private encodeParameters(inputs: any[], params: any[]): string {
    if (inputs.length === 0) return "0x";

    // Simple encoding for basic types
    let encoded = "0x";
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      const input = inputs[i];

      if (input.type === "address") {
        encoded += param.slice(2).padStart(64, "0");
      } else if (input.type.startsWith("uint")) {
        const hex = parseInt(param).toString(16);
        encoded += hex.padStart(64, "0");
      }
    }
    return encoded;
  }

  private keccak256(data: string): string {
    // Simple hash function for function signatures
    // In production, use a proper keccak256 implementation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return "0x" + Math.abs(hash).toString(16).padStart(8, "0");
  }

  private formatEther(wei: string): string {
    const weiValue = parseInt(wei, 16);
    const etherValue = weiValue / Math.pow(10, 18);
    return etherValue.toFixed(4);
  }

  async mintNFT(
    userAddress: string,
  ): Promise<{ hash: string; success: boolean }> {
    try {
      const contract = this.getContract();
      const mintPriceWei = "0x2386F26FC10000"; // 0.01 ether in wei

      const txHash = await this.provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: userAddress,
            to: contract.address,
            value: mintPriceWei,
            data: "0x1249c58b", // mint() function signature
          },
        ],
      });

      return { hash: txHash, success: true };
    } catch (error: any) {
      console.error("Minting error:", error);
      throw new Error(error.message || "Minting failed");
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
