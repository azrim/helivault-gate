// src/context/DeploymentContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface DeploymentState {
  logs: string[];
  isDeploying: boolean;
  deploymentCompleted: boolean;
  deployedContracts: Record<string, string>;
}

interface DeploymentContextType extends DeploymentState {
  setLogs: (logs: string[]) => void;
  addLog: (log: string) => void;
  setIsDeploying: (isDeploying: boolean) => void;
  setDeploymentCompleted: (isCompleted: boolean) => void;
  setDeployedContracts: (contracts: Record<string, string>) => void;
  resetDeployment: () => void;
}

const DeploymentContext = createContext<DeploymentContextType | undefined>(undefined);

export const useDeployment = () => {
  const context = useContext(DeploymentContext);
  if (!context) {
    throw new Error('useDeployment must be used within a DeploymentProvider');
  }
  return context;
};

const initialState: DeploymentState = {
  logs: [],
  isDeploying: false,
  deploymentCompleted: false,
  deployedContracts: {},
};

export const DeploymentProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<DeploymentState>(initialState);

  const setLogs = (logs: string[]) => setState(prev => ({ ...prev, logs }));
  const addLog = (log: string) => setState(prev => ({ ...prev, logs: [...prev.logs, log] }));
  const setIsDeploying = (isDeploying: boolean) => setState(prev => ({ ...prev, isDeploying }));
  const setDeploymentCompleted = (isCompleted: boolean) => setState(prev => ({ ...prev, deploymentCompleted: isCompleted }));
  const setDeployedContracts = (contracts: Record<string, string>) => setState(prev => ({ ...prev, deployedContracts: contracts }));
  const resetDeployment = () => setState(initialState);

  const value = {
    ...state,
    setLogs,
    addLog,
    setIsDeploying,
    setDeploymentCompleted,
    setDeployedContracts,
    resetDeployment,
  };

  return (
    <DeploymentContext.Provider value={value}>
      {children}
    </DeploymentContext.Provider>
  );
};
