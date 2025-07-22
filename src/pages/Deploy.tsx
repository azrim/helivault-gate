// src/pages/Deploy.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, Rocket, FileJson, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useDeployment } from '@/context/DeploymentContext';

import CronJob from '../contracts/CronJob.json';
import HyperionClient from '../contracts/HyperionClient.json';

const ALL_CONTRACTS = [
  { name: 'CronJob', artifact: CronJob },
  { name: 'HyperionClient', artifact: HyperionClient },
];

const Deploy: React.FC = () => {
  const { address, isConnected } = useAccount();
  const {
    logs,
    addLog,
    isDeploying,
    setIsDeploying,
    deploymentCompleted,
    setDeploymentCompleted,
    deployedContracts,
    setDeployedContracts,
    resetDeployment,
  } = useDeployment();

  const [selectedContracts, setSelectedContracts] = useState<Record<string, boolean>>(
    ALL_CONTRACTS.reduce((acc, { name }) => ({ ...acc, [name]: true }), {})
  );
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset local component state if context is reset
    if (logs.length === 0 && !isDeploying) {
      setProgress(0);
      setError(null);
    }
  }, [logs, isDeploying]);

  const handleSelectContract = (name: string, checked: boolean) => {
    setSelectedContracts(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedContracts(
      ALL_CONTRACTS.reduce((acc, { name }) => ({ ...acc, [name]: checked }), {})
    );
  };

  const handleDeploy = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first.');
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
        const contractInfo = contractsToDeploy[i];
        const { name, artifact } = contractInfo;
        const logPrefix = `[${new Date().toLocaleTimeString()}] [${name}]`;

        try {
          addLog(`${logPrefix} Starting deployment...`);
          const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
          const contract = await factory.deploy();
          
          const txHash = contract.deploymentTransaction()?.hash;
          addLog(`${logPrefix} Transaction sent: ${txHash}`);
          toast.info(`Deploying ${name}...`, { description: `Tx: ${txHash}` });

          await contract.waitForDeployment();
          const contractAddress = await contract.getAddress();
          
          newDeployedContracts[name] = contractAddress;
          addLog(`${logPrefix} Deployed successfully at ${contractAddress}`);
          toast.success(`${name} deployed successfully!`, { description: `Address: ${contractAddress}` });

        } catch (e: any) {
          console.error(`Failed to deploy ${name}:`, e);
          addLog(`${logPrefix} Deployment FAILED: ${e.message}`);
          toast.error(`Failed to deploy ${name}`, { description: e.message });
          failedDeployments++;
        } finally {
            setProgress(((i + 1) / contractsToDeploy.length) * 100);
        }
      }

      setDeployedContracts(newDeployedContracts);

      if(failedDeployments > 0) {
        const errorMsg = `${failedDeployments} contract(s) failed to deploy.`;
        setError(errorMsg);
        addLog(`[ERROR] ${errorMsg}`);
      } else {
        addLog("All selected contracts deployed successfully!");
      }

    } catch (e: any) {
      console.error(e);
      const errorMsg = `An unexpected error occurred: ${e.message}`;
      setError(errorMsg);
      addLog(`[FATAL] ${errorMsg}`);
      toast.error('An unexpected error occurred.', { description: e.message });
    } finally {
      setIsDeploying(false);
      setDeploymentCompleted(true);
    }
  };

  const allSelected = Object.values(selectedContracts).every(v => v);

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-6 w-6" />
              Deploy Automation Contracts
            </CardTitle>
            {(logs.length > 0 || isDeploying) && (
              <Button variant="ghost" size="icon" onClick={resetDeployment} disabled={isDeploying}>
                <RefreshCw className={`h-4 w-4 ${isDeploying ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
          <CardDescription>
            Select the automation contracts you wish to deploy to the Helios network.
            Your deployment progress will be preserved even if you navigate away.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Deployment Issue</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3">
                <label htmlFor="select-all" className="font-medium">Select Contracts</label>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="select-all"
                        checked={allSelected}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        disabled={isDeploying}
                    />
                    <span className="text-sm text-muted-foreground">Select All</span>
                </div>
            </div>
            {ALL_CONTRACTS.map(contract => (
              <div key={contract.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={contract.name}
                    checked={selectedContracts[contract.name]}
                    onCheckedChange={(checked) => handleSelectContract(contract.name, !!checked)}
                    disabled={isDeploying}
                  />
                  <label htmlFor={contract.name} className="flex items-center gap-3 cursor-pointer">
                    <FileJson className="h-5 w-5 text-muted-foreground" />
                    <span>{contract.name}</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {isDeploying && (
            <div className="mb-4">
              <Progress value={progress} />
            </div>
          )}

          <Button
            onClick={handleDeploy}
            disabled={isDeploying || !isConnected || Object.values(selectedContracts).every(v => !v)}
            className="w-full"
          >
            {isDeploying ? 'Deployment in Progress...' : `Deploy ${Object.values(selectedContracts).filter(v => v).length} Contract(s)`}
          </Button>
        </CardContent>
      </Card>

      {(logs.length > 0) && (
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Deployment Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-white font-mono text-sm p-4 rounded-lg h-64 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className={log.includes('FAILED') || log.includes('ERROR') ? 'text-red-400' : log.includes('successfully') ? 'text-green-400' : ''}>
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
       {deploymentCompleted && Object.keys(deployedContracts).length > 0 && (
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Deployed Contracts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(deployedContracts).map(([name, deployedAddress]) => (
              <div key={name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">{name}</span>
                <a href={`https://explorer.helioschainlabs.org/address/${deployedAddress}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
                  {`${deployedAddress.slice(0, 6)}...${deployedAddress.slice(-4)}`}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Deploy;
