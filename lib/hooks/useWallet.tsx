"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { BOT_CHAIN_CONFIG, DEFAULT_NETWORK, getNetworkConfig } from "@/lib/config/botchain";
import { NetworkType } from "@/types";

interface WalletContextType {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  networkType: NetworkType;
  botBalance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (targetNetwork?: NetworkType) => Promise<boolean>;
  getSigner: () => Promise<ethers.Signer | null>;
  isDemoWallet: boolean;
  enableDemoWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [networkType, setNetworkType] = useState<NetworkType>(DEFAULT_NETWORK);
  const [botBalance, setBotBalance] = useState<string>("0.00");
  const [isDemoWallet, setIsDemoWallet] = useState<boolean>(false);

  const targetConfig = getNetworkConfig(networkType);
  const isConnected = !!address;
  const isCorrectNetwork = isDemoWallet || chainId === targetConfig.chainId;

  // Refresh balance
  const updateBalance = useCallback(async (accountAddress: string, provider: ethers.Provider) => {
    try {
      const balance = await provider.getBalance(accountAddress);
      setBotBalance(parseFloat(ethers.formatEther(balance)).toFixed(4));
    } catch {
      // Graceful fallback for rate-limited RPCs
    }
  }, []);

  // Listen for account/chain changes only when already connected
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const eth = (window as any).ethereum;

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setAddress(null);
          setBotBalance("0.00");
          setIsDemoWallet(false);
        } else {
          setAddress(accounts[0]);
          const provider = new ethers.BrowserProvider(eth);
          updateBalance(accounts[0], provider);
        }
      };

      const handleChainChanged = (hexChain: string) => {
        setChainId(parseInt(hexChain, 16));
      };

      eth.on("accountsChanged", handleAccountsChanged);
      eth.on("chainChanged", handleChainChanged);

      return () => {
        eth.removeListener("accountsChanged", handleAccountsChanged);
        eth.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [updateBalance]);

  const connectWallet = async () => {
    if (typeof window === "undefined") return;
    setIsConnecting(true);

    try {
      if ((window as any).ethereum) {
        const eth = (window as any).ethereum;
        const accounts = await eth.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          const hexChain = await eth.request({ method: "eth_chainId" });
          setChainId(parseInt(hexChain, 16));
          setIsDemoWallet(false);

          const provider = new ethers.BrowserProvider(eth);
          await updateBalance(accounts[0], provider);
        }
      } else {
        // Provide demo wallet for testing without extension
        enableDemoWallet();
      }
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
      if (err?.code !== 4001) {
        // User didn't just reject; allow demo wallet fallback
        enableDemoWallet();
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const enableDemoWallet = () => {
    // Generate or use a realistic test address
    const mockAddr = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    setAddress(mockAddr);
    setChainId(targetConfig.chainId);
    setBotBalance("14.50");
    setIsDemoWallet(true);
    localStorage.setItem("botseat_demo_wallet", mockAddr);
  };

  const disconnectWallet = () => {
    setAddress(null);
    setChainId(null);
    setBotBalance("0.00");
    setIsDemoWallet(false);
    localStorage.removeItem("botseat_demo_wallet");
  };

  const switchNetwork = async (target: NetworkType = networkType): Promise<boolean> => {
    const config = getNetworkConfig(target);
    setNetworkType(target);

    if (isDemoWallet) {
      setChainId(config.chainId);
      return true;
    }

    if (typeof window !== "undefined" && (window as any).ethereum) {
      const eth = (window as any).ethereum;
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: config.hexChainId }],
        });
        setChainId(config.chainId);
        return true;
      } catch (switchError: any) {
        // If the chain hasn't been added to MetaMask (error 4902)
        if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
          try {
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: config.hexChainId,
                  chainName: config.name,
                  nativeCurrency: {
                    name: "BOT Token",
                    symbol: config.currencySymbol,
                    decimals: 18,
                  },
                  rpcUrls: [config.rpcUrl],
                  blockExplorerUrls: [config.explorerUrl],
                },
              ],
            });
            setChainId(config.chainId);
            return true;
          } catch (addError) {
            console.error("Failed to add BOT Chain to wallet:", addError);
            return false;
          }
        }
        console.error("Failed to switch network:", switchError);
        return false;
      }
    }
    return false;
  };

  const getSigner = async (): Promise<ethers.Signer | null> => {
    if (isDemoWallet) {
      // In demo mode with no injected wallet, return a simulated signer
      const provider = new ethers.JsonRpcProvider(targetConfig.rpcUrl);
      const randomWallet = ethers.Wallet.createRandom().connect(provider);
      return randomWallet;
    }

    if (typeof window !== "undefined" && (window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      return provider.getSigner();
    }
    return null;
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        isConnecting,
        isConnected,
        isCorrectNetwork,
        networkType,
        botBalance,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        getSigner,
        isDemoWallet,
        enableDemoWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
