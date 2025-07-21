// src/pages/Deploy.tsx
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, Rocket, FileJson, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import CronJob from '../contracts/CronJob.json';
import HyperionClient from '../contracts/HyperionClient.json';

const ALL_CONTRACTS = [
  { name: 'CronJob', artifact: CronJob },
  { name: 'HyperionClient', artifact: HyperionClient },
];

type DeploymentStatus = {
    status: 'deploying' | 'failed' | 'deployed';
    txHash?: string;
    address?: string;
};

const Deploy: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [selectedContracts, setSelectedContracts] = useState<Record<string, boolean>>(
    ALL_CONTRACTS.reduce((acc, { name }) => ({ ...acc, [name]: true }), {})
  );
  const [deploymentStatus, setDeploymentStatus] = useState<Record<string, DeploymentStatus>>({});
  const [isDeploying, setIsDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

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

    setIsDeploying(true);
    setError(null);
    setDeploymentStatus({});
    setProgress(0);

    const contractsToDeploy = ALL_CONTRACTS.filter(c => selectedContracts[c.name]);
    let failedDeployments = 0;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();

      for (let i = 0; i < contractsToDeploy.length; i++) {
        const contractInfo = contractsToDeploy[i];
        const { name, artifact } = contractInfo;

        try {
          setDeploymentStatus(prev => ({ ...prev, [name]: { status: 'deploying' } }));
          const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
          const contract = await factory.deploy();
          
          const txHash = contract.deploymentTransaction()?.hash;
          setDeploymentStatus(prev => ({ ...prev, [name]: { status: 'deploying', txHash } }));
          toast.info(`Deploying ${name}...`, { description: `Tx: ${txHash}` });

          await contract.waitForDeployment();
          const contractAddress = await contract.getAddress();
          setDeploymentStatus(prev => ({ ...prev, [name]: { status: 'deployed', txHash, address: contractAddress } }));
          toast.success(`${name} deployed successfully!`, { description: `Address: ${contractAddress}` });
        } catch (e: any) {
          console.error(`Failed to deploy ${name}:`, e);
          setDeploymentStatus(prev => ({ ...prev, [name]: { status: 'failed' } }));
          toast.error(`Failed to deploy ${name}`, { description: e.message });
          failedDeployments++;
        } finally {
            setProgress(((i + 1) / contractsToDeploy.length) * 100);
        }
      }

      if(failedDeployments > 0) {
        setError(`${failedDeployments} contract(s) failed to deploy.`);
      }

    } catch (e: any) {
      console.error(e);
      setError(e.message);
      toast.error('An unexpected error occurred.', { description: e.message });
    } finally {
      setIsDeploying(false);
    }
  };

  const allSelected = Object.values(selectedContracts).every(v => v);

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-6 w-6" />
            Deploy Automation Contracts
          </CardTitle>
          <CardDescription>
            Select the automation contracts you wish to deploy to the Helios network.
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
                    />
                    <span className="text-sm text-muted-foreground">Select All</span>
                </div>
            </div>
            {ALL_CONTRACTS.map(contract => {
              const status = deploymentStatus[contract.name];
              return (
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
                <div>
                  {status?.status === 'deploying' && <span className="text-sm text-muted-foreground">Deploying...</span>}
                  {status?.status === 'deployed' && (
                    <div className="flex items-center gap-4 text-green-500">
                      <CheckCircle className="h-5 w-5" />
                      <div className="flex gap-3">
                        <a href={`https://explorer.helioschainlabs.org/tx/${status.txHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm hover:underline">
                          TX <ExternalLink className="h-3 w-3" />
                        </a>
                        <a href={`https://explorer.helioschainlabs.org/address/${status.address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm hover:underline">
                          CA <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                  {status?.status === 'failed' && (
                    <div className="flex items-center gap-2 text-red-500">
                      <XCircle className="h-5 w-5" />
                      <span className="text-sm">Failed</span>
                    </div>
                  )}
                </div>
              </div>
            )})}
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
    </div>
  );
};

export default Deploy;