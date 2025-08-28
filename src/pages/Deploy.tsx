import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
// All necessary wagmi hooks are imported here
import { useAccount, useWriteContract, useGasPrice } from 'wagmi'; // Use useGasPrice
import { parseUnits } from 'viem';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  XCircle,
  Rocket,
  FileJson,
  ExternalLink,
  RefreshCw,
  Boxes,
  Coins,
  FileCode,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDeployment } from '@/context/DeploymentContext';
import CronJob from '../contracts/CronJob.json';
import HyperionClient from '../contracts/HyperionClient.json';
// Import the correct ABI directly
import HeliosERC20Factory from '../contracts/HeliosERC20Factory.json';
import { motion } from 'framer-motion';
import Page from '@/components/Page';

// --- Tab: Batch Deployer ---
const ALL_CONTRACTS = [
  { name: 'CronJob', artifact: CronJob },
  { name: 'HyperionClient', artifact: HyperionClient },
];

const BatchDeployer = () => {
  const { deployedContracts, addLog, setIsDeploying, setDeployedContracts, setDeploymentCompleted } = useDeployment();
  const [selectedContracts, setSelectedContracts] = useState<Record<string, boolean>>(
    ALL_CONTRACTS.reduce((acc, { name }) => ({ ...acc, [name]: true }), {})
  );
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    setProgress(0);
    const contractsToDeploy = ALL_CONTRACTS.filter((c) => selectedContracts[c.name]);
    let newDeployedContracts: Record<string, string> = {};
    let failedDeployments = 0;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      for (let i = 0; i < contractsToDeploy.length; i++) {
        const { name, artifact } = contractsToDeploy[i];
        const logPrefix = `[${name}]`;
        try {
          addLog(`${logPrefix} Deploying...`);
          const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
          const contract = await factory.deploy();
          await contract.waitForDeployment();
          const address = await contract.getAddress();
          newDeployedContracts[name] = address;
          addLog(`${logPrefix} Deployed successfully at ${address}`);
          toast.success(`${name} deployed!`);
        } catch (e: any) {
          addLog(`${logPrefix} FAILED: ${e.message}`);
          toast.error(`Failed to deploy ${name}`);
          failedDeployments++;
        } finally {
          setProgress(((i + 1) / contractsToDeploy.length) * 100);
        }
      }
      setDeployedContracts({ ...deployedContracts, ...newDeployedContracts });
      if (failedDeployments > 0) setError(`${failedDeployments} contract(s) failed to deploy.`);
    } catch (e: any) {
      setError(`An unexpected error occurred: ${e.message}`);
      addLog(`[FATAL] ${e.message}`);
    } finally {
      setIsDeploying(false);
      setDeploymentCompleted(true);
    }
  };

  const allSelected = Object.values(selectedContracts).every((v) => v);

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive"><XCircle className="h-4 w-4" /><AlertTitle>Deployment Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
          <label htmlFor="select-all" className="font-medium">Select All Contracts</label>
          <Checkbox id="select-all" checked={allSelected} onCheckedChange={(c) => setSelectedContracts(ALL_CONTRACTS.reduce((acc, { name }) => ({ ...acc, [name]: !!c }), {}))} />
        </div>
        {ALL_CONTRACTS.map((c) => (
          <div key={c.name} className="flex items-center justify-between p-3 rounded-lg">
            <div className="flex items-center gap-3"><FileJson className="h-5 w-5 text-muted-foreground" /><span>{c.name}</span></div>
            <Checkbox id={c.name} checked={selectedContracts[c.name]} onCheckedChange={(checked) => setSelectedContracts((p) => ({ ...p, [c.name]: !!checked }))} />
          </div>
        ))}
      </div>
      <Progress value={progress} />
      <Button onClick={handleDeploy} className="w-full"><Rocket className="mr-2 h-4 w-4" />{`Deploy ${Object.values(selectedContracts).filter(v => v).length} Contract(s)`}</Button>
    </div>
  );
};

// --- Tab: Token Deployer ---
const tokenFormSchema = z.object({
  name: z.string()
    .min(1, { message: "Token name cannot be empty." })
    .refine(s => !s.includes(' '), "Token name cannot contain spaces."),
  symbol: z.string().min(1, { message: "Token symbol cannot be empty." }),
  decimals: z.coerce.number().int().min(0).max(18),
  supply: z.coerce.number().int().positive({ message: "Supply must be a positive number." }),
});

const TokenDeployer = () => {
    const { deployedContracts, addLog, setIsDeploying, setDeployedContracts, setDeploymentCompleted } = useDeployment();
    const { address, chain } = useAccount();
    const { data: gasPrice } = useGasPrice(); // Use the non-deprecated hook
    const { data: hash, writeContract, isPending, isSuccess, isError, error } = useWriteContract();
    const [submittedTx, setSubmittedTx] = useState<{name: string, symbol: string} | null>(null);

    const form = useForm<z.infer<typeof tokenFormSchema>>({
        resolver: zodResolver(tokenFormSchema),
        defaultValues: { name: "", symbol: "", decimals: 18, supply: 1000000 },
    });

    const onSubmit = (values: z.infer<typeof tokenFormSchema>) => {
        if (!address || !chain) {
            toast.error("Wallet not connected or chain is not supported.");
            return;
        }
        if (!gasPrice) {
            toast.error("Could not fetch gas price. Please try again.");
            return;
        }

        const logPrefix = `[${values.symbol}]`;
        addLog(`${logPrefix} Preparing transaction...`);
        setSubmittedTx({ name: values.name, symbol: values.symbol });

        const randomSuffix = Math.random().toString(36).substring(2, 6);
        const uniqueDenom = `a${values.symbol.toLowerCase()}${randomSuffix}`;

        writeContract({
            address: '0x0000000000000000000000000000000000000806',
            abi: HeliosERC20Factory.abi,
            functionName: 'createErc20',
            args: [
                values.name,
                values.symbol,
                uniqueDenom,
                parseUnits(values.supply.toString(), values.decimals),
                values.decimals,
                ""
            ],
            account: address,
            chain: chain,
            gasPrice: gasPrice,
        });
    };

    useEffect(() => {
        setIsDeploying(isPending);
    }, [isPending, setIsDeploying]);
    
    useEffect(() => {
        if (isSuccess && hash && submittedTx) {
            const logPrefix = `[${submittedTx.symbol}]`;
            addLog(`${logPrefix} Transaction successful! Hash: ${hash}`);
            toast.success(`${submittedTx.name} deployment confirmed!`);
            setDeployedContracts({ ...deployedContracts, [submittedTx.name]: `(Confirmed)` });
            setDeploymentCompleted(true);
            form.reset();
            setSubmittedTx(null);
        }
    }, [isSuccess, hash, submittedTx, addLog, setDeploymentCompleted, form, deployedContracts, setDeployedContracts]);

    useEffect(() => {
        if (isError && error && submittedTx) {
            const logPrefix = `[${submittedTx.symbol}]`;
            const errorMessage = (error.message.split('Details:')[0] || 'An unknown error occurred.').trim();
            addLog(`${logPrefix} FAILED: ${errorMessage}`);
            toast.error(errorMessage);
            setDeploymentCompleted(true);
            setSubmittedTx(null);
        }
    }, [isError, error, submittedTx, addLog, setDeploymentCompleted]);

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Token Name</FormLabel><FormControl><Input placeholder="e.g., MyToken" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="symbol" render={({ field }) => (<FormItem><FormLabel>Token Symbol</FormLabel><FormControl><Input placeholder="e.g., MTK" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="decimals" render={({ field }) => (<FormItem><FormLabel>Decimals</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="supply" render={({ field }) => (<FormItem><FormLabel>Total Supply</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}><Coins className="mr-2 h-4 w-4" />{isPending ? 'Check Wallet...' : 'Deploy Token'}</Button>
                </form>
            </Form>
        </div>
    );
};

// --- Tab: Custom Contract Deployer ---
const CustomDeployer = () => {
    const { deployedContracts, addLog, setIsDeploying, setDeployedContracts, setDeploymentCompleted } = useDeployment();
    const [abi, setAbi] = useState("");
    const [bytecode, setBytecode] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleDeploy = async () => {
        setIsDeploying(true);
        setError(null);
        const logPrefix = `[CustomContract]`;

        try {
            addLog(`${logPrefix} Validating ABI and bytecode...`);
            const parsedAbi = JSON.parse(abi);
            if (!bytecode.startsWith('0x')) throw new Error("Bytecode must be a hex string starting with 0x");

            const provider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();
            
            addLog(`${logPrefix} Deploying...`);
            const factory = new ethers.ContractFactory(parsedAbi, bytecode, signer);
            const contract = await factory.deploy();
            await contract.waitForDeployment();
            const address = await contract.getAddress();
            
            setDeployedContracts({ ...deployedContracts, "Custom Contract": address });
            addLog(`${logPrefix} Deployed successfully at ${address}`);
            toast.success(`Custom contract deployed!`);
        } catch (e: any) {
            addLog(`${logPrefix} FAILED: ${e.message}`);
            toast.error(`Failed to deploy custom contract.`);
            setError(e.message);
        } finally {
            setIsDeploying(false);
            setDeploymentCompleted(true);
        }
    };

    return (
        <div className="space-y-6">
             {error && <Alert variant="destructive"><XCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="space-y-2"><Label htmlFor="abi">Contract ABI</Label><Textarea id="abi" placeholder="Paste your ABI here..." rows={5} value={abi} onChange={e => setAbi(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="bytecode">Bytecode</Label><Textarea id="bytecode" placeholder="Paste your 0x-prefixed bytecode here..." rows={5} value={bytecode} onChange={e => setBytecode(e.target.value)} /></div>
            <Button onClick={handleDeploy} className="w-full" disabled={!abi || !bytecode}><FileCode className="mr-2 h-4 w-4" />Deploy Custom Contract</Button>
        </div>
    );
};

// --- Main Deploy Page Component ---
const Deploy: React.FC = () => {
  const { logs, isDeploying, deploymentCompleted, deployedContracts, resetDeployment } = useDeployment();

  return (
    <Page title="Deploy" description="Deploy smart contracts and tokens to the Helios network.">
      <div className="space-y-16 pb-24">
        <section className="text-center pt-24 pb-12">
           <motion.h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 hero-glow" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
             Universal <span className="text-primary">Deployer</span>
           </motion.h1>
           <motion.p className="max-w-2xl mx-auto text-lg text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
             Deploy predefined batches, create new tokens, or launch custom contracts from one unified interface.
           </motion.p>
        </section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="grid lg:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Deployment Options</CardTitle>
                  {(logs.length > 0 || isDeploying) && (<Button variant="ghost" size="icon" onClick={resetDeployment} disabled={isDeploying}><RefreshCw className={`h-4 w-4 ${isDeploying ? "animate-spin" : ""}`} /></Button>)}
                </div>
                <CardDescription>Your deployment progress is saved in the logs.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="batch">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="batch"><Boxes className="mr-2 h-4 w-4"/>Batch</TabsTrigger>
                        <TabsTrigger value="token"><Coins className="mr-2 h-4 w-4"/>Token</TabsTrigger>
                        <TabsTrigger value="custom"><FileCode className="mr-2 h-4 w-4"/>Custom</TabsTrigger>
                    </TabsList>
                    <div className="pt-6">
                        <TabsContent value="batch"><BatchDeployer /></TabsContent>
                        <TabsContent value="token"><TokenDeployer /></TabsContent>
                        <TabsContent value="custom"><CustomDeployer /></TabsContent>
                    </div>
                </Tabs>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardHeader><CardTitle>Logs</CardTitle></CardHeader>
                <CardContent>
                  <div className="bg-black text-white font-mono text-xs p-4 rounded-lg h-96 overflow-y-auto">
                    {logs.length > 0 ? (logs.map((log, i) => (<p key={i} className={ log.includes("FAILED") ? "text-red-400" : log.includes("successfully") ? "text-green-400" : "" }>{log}</p>))) : (<p className="text-gray-400">No logs yet. Start a deployment to see progress.</p>)}
                  </div>
                </CardContent>
              </Card>

              {deploymentCompleted && Object.keys(deployedContracts).length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>Deployed Contracts</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {Object.entries(deployedContracts).map(([name, address]) => (
                          <div key={name} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                            <span className="font-medium">{name}</span>
                            {address.startsWith('0x') ? (<a href={`https://explorer.helioschainlabs.org/address/${address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">{`${address.slice(0, 6)}...${address.slice(-4)}`}<ExternalLink className="h-4 w-4" /></a>) : (<span className="text-sm text-muted-foreground">{address}</span>)}
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                )}
            </div>
          </div>
        </motion.section>
      </div>
    </Page>
  );
};

export default Deploy;