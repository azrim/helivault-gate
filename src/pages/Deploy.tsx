// src/pages/Deploy.tsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { XCircle, Rocket, FileJson, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useDeployment } from "@/context/DeploymentContext";
import CronJob from "../contracts/CronJob.json";
import HyperionClient from "../contracts/HyperionClient.json";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

const ALL_CONTRACTS = [
  { name: "CronJob", artifact: CronJob },
  { name: "HyperionClient", artifact: HyperionClient },
];

const Deploy: React.FC = () => {
  const { isConnected } = useAccount();
  const {
    logs, addLog, isDeploying, setIsDeploying,
    deploymentCompleted, setDeploymentCompleted,
    deployedContracts, setDeployedContracts, resetDeployment,
  } = useDeployment();

  const [selectedContracts, setSelectedContracts] = useState<Record<string, boolean>>(
    ALL_CONTRACTS.reduce((acc, { name }) => ({ ...acc, [name]: true }), {})
  );
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (logs.length === 0 && !isDeploying) {
      setProgress(0);
      setError(null);
    }
  }, [logs, isDeploying]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedContracts(
      ALL_CONTRACTS.reduce((acc, { name }) => ({ ...acc, [name]: checked }), {})
    );
  };

  const handleDeploy = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }

    resetDeployment();
    setIsDeploying(true);
    setError(null);
    setProgress(0);

    const contractsToDeploy = ALL_CONTRACTS.filter(c => selectedContracts[c.name]);
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
      setDeployedContracts(newDeployedContracts);
      if (failedDeployments > 0) setError(`${failedDeployments} contract(s) failed to deploy.`);
    } catch (e: any) {
      setError(`An unexpected error occurred: ${e.message}`);
      addLog(`[FATAL] ${e.message}`);
    } finally {
      setIsDeploying(false);
      setDeploymentCompleted(true);
    }
  };

  const allSelected = Object.values(selectedContracts).every(v => v);

  return (
    <>
      <Helmet>
        <title>Deploy Contracts – Helivault Gate</title>
      </Helmet>
      <div className="space-y-16 pb-24">
        {/* Header */}
        <section className="text-center pt-24 pb-12">
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 hero-glow"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Deploy <span className="text-primary">Contracts</span>
          </motion.h1>
          <motion.p
            className="max-w-2xl mx-auto text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Select and deploy your automation contracts to the Helios network with a single click.
          </motion.p>
        </section>

        {/* Deploy Section */}
        <motion.section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="grid lg:grid-cols-2 gap-12">
            {/* --- Left Column --- */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Contract Deployment</CardTitle>
                  {(logs.length > 0 || isDeploying) && (
                    <Button variant="ghost" size="icon" onClick={resetDeployment} disabled={isDeploying}>
                      <RefreshCw className={`h-4 w-4 ${isDeploying ? "animate-spin" : ""}`} />
                    </Button>
                  )}
                </div>
                <CardDescription>
                  Your deployment progress is saved even if you navigate away.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Deployment Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <label htmlFor="select-all" className="font-medium">Select All Contracts</label>
                    <Checkbox id="select-all" checked={allSelected} onCheckedChange={(c) => handleSelectAll(!!c)} disabled={isDeploying} />
                  </div>
                  {ALL_CONTRACTS.map(c => (
                    <div key={c.name} className="flex items-center justify-between p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileJson className="h-5 w-5 text-muted-foreground" />
                        <span>{c.name}</span>
                      </div>
                      <Checkbox id={c.name} checked={selectedContracts[c.name]} onCheckedChange={(checked) => setSelectedContracts(p => ({ ...p, [c.name]: !!checked }))} disabled={isDeploying} />
                    </div>
                  ))}
                </div>
                {isDeploying && <Progress value={progress} />}
                <Button onClick={handleDeploy} disabled={isDeploying || !isConnected || !Object.values(selectedContracts).some(v => v)} className="w-full h-12 text-lg">
                  <Rocket className="mr-2 h-5 w-5" />
                  {isDeploying ? "Deploying..." : `Deploy ${Object.values(selectedContracts).filter(v => v).length} Contract(s)`}
                </Button>
              </CardContent>
            </Card>

            {/* --- Right Column --- */}
            <div className="space-y-8">
              {logs.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Logs</CardTitle></CardHeader>
                  <CardContent>
                    <div className="bg-black text-white font-mono text-xs p-4 rounded-lg h-96 overflow-y-auto">
                      {logs.map((log, i) => (
                        <p key={i} className={log.includes("FAILED") ? "text-red-400" : log.includes("successfully") ? "text-green-400" : ""}>{log}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {deploymentCompleted && Object.keys(deployedContracts).length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Deployed Contracts</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(deployedContracts).map(([name, address]) => (
                      <div key={name} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <span className="font-medium">{name}</span>
                        <a href={`https://explorer.helioschainlabs.org/address/${address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                          {`${address.slice(0, 6)}...${address.slice(-4)}`}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default Deploy;
