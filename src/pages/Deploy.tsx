import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Check, ExternalLink } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { heliosTestnet } from "@/lib/chains";

// Example pre-compiled Greeter contract ABI and Bytecode
const greeterContract = {
  abi: [{"inputs":[{"internalType":"string","name":"_greeting","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"greet","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}],
  bytecode: "0x608060405234801561001057600080fd5b506040516101c13803806101c18339818101604052602081101561003357600080fd5b81019080805190602001909291905050506000805461005c906100a4565b80601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550929150565b6000602082840312156100b657600080fd5b813567ffffffffffffffff8111156100cf57600080fd5b60208201356100e0565b61013760048201565b80820180602083015260408201526060820152608082015260a082015260c082015260e081015260005b8181101561012c57600080602090810190610116565b505060009150565b600060808201905061014760008301846100f2565b92915050565b60005481565b61015d9081565b610166610169565b90565b60009056" as `0x${string}`,
};

const Deploy = () => {
  const { address, isConnected, chain } = useAccount();
  const { data: hash, isPending, writeContract } = useWriteContract();
  
  const [greeting, setGreeting] = useState("Hello, Helios!");

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Contract deployed successfully!");
    }
  }, [isConfirmed]);

  const handleDeploy = async () => {
    if (!greeting) {
      toast.error("Please enter a greeting message.");
      return;
    }
    writeContract({
      abi: greeterContract.abi,
      bytecode: greeterContract.bytecode,
      args: [greeting],
    });
  };

  const isCorrectNetwork = chain?.id === heliosTestnet.id;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Deploy – Helivault Gate</title>
      </Helmet>
      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Rocket className="h-6 w-6" />
              Deploy a Contract
            </CardTitle>
            <CardDescription className="text-center">
              Deploy a pre-compiled "Greeter" smart contract to the network.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="greeting">Greeting Message</Label>
              <Input
                id="greeting"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                placeholder="Enter a greeting for your contract"
              />
              <p className="text-sm text-muted-foreground">
                This message will be stored on the blockchain when the contract is deployed.
              </p>
            </div>

            <div className="pt-4">
              {!isConnected ? (
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              ) : !isCorrectNetwork ? (
                 <div className="flex justify-center">
                  <ConnectButton label="Wrong Network" />
                </div>
              ) : (
                <Button 
                  onClick={handleDeploy} 
                  disabled={isPending || isConfirming}
                  className="w-full h-12 text-lg"
                >
                  {isPending || isConfirming ? "Deploying..." : "Deploy Contract"}
                </Button>
              )}
            </div>

            {hash && (
              <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-semibold mb-2">Transaction Sent</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate">
                    Hash: {hash.slice(0, 10)}...{hash.slice(-8)}
                  </span>
                  <a href={`${heliosTestnet.blockExplorers.default.url}/tx/${hash}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      View on Explorer <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </a>
                </div>
                {isConfirming && <p className="text-sm text-muted-foreground mt-2">Waiting for confirmation...</p>}
                {isConfirmed && <p className="text-sm text-success mt-2 flex items-center gap-1"><Check className="h-4 w-4" /> Transaction confirmed!</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Deploy;