"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { BOT_CHAIN_CONFIG, DEFAULT_NETWORK, getNetworkConfig } from "@/lib/config/botchain";
import { NetworkConfig, NetworkType } from "@/types";

interface WalletContextType {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  networkType: NetworkType;
  networkName: string;
  targetConfig: NetworkConfig;
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
  const isCorrectNetwork = isDemoWallet || (chainId !== null && Number(chainId) === targetConfig.chainId);

  const parseChainId = (rawChainId: any): number | null => {
    if (!rawChainId) return null;
    if (typeof rawChainId === "number") return rawChainId;
    if (typeof rawChainId === "string") {
      return rawChainId.startsWith("0x") ? parseInt(rawChainId, 16) : parseInt(rawChainId, 10);
    }
    return Number(rawChainId) || null;
  };

  const getNetworkName = (id: number | null): string => {
    if (!id) return "Unknown Network";
    if (id === 677) return "BOT Chain Mainnet";
    if (id === 968) return "BOT Chain Testnet";
    if (id === 1) return "Ethereum Mainnet";
    if (id === 11155111) return "Sepolia Testnet";
    if (id === 137) return "Polygon Mainnet";
    if (id === 56) return "BNB Chain";
    if (id === 42161) return "Arbitrum One";
    if (id === 10) return "Optimism";
    if (id === 8453) return "Base";
    return `Chain ID ${id}`;
  };

  // Refresh balance
  const updateBalance = useCallback(async (accountAddress: string, provider: ethers.Provider) => {
    try {
      const balance = await provider.getBalance(accountAddress);
      setBotBalance(parseFloat(ethers.formatEther(balance)).toFixed(4));
    } catch {
      // Graceful fallback for rate-limited RPCs
    }
  }, []);

  // Listen for account/chain changes and restore initial connection on mount
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const eth = (window as any).ethereum;

      const initWallet = async () => {
        try {
          const accounts = await eth.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            const rawChain = await eth.request({ method: "eth_chainId" });
            const parsedChain = parseChainId(rawChain);
            setChainId(parsedChain);
            const provider = new ethers.BrowserProvider(eth);
            await updateBalance(accounts[0], provider);
          }
        } catch (err) {
          console.error("Initial wallet sync failed:", err);
        }
      };

      initWallet();

      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          setAddress(null);
          setChainId(null);
          setBotBalance("0.00");
          setIsDemoWallet(false);
        } else {
          setAddress(accounts[0]);
          try {
            const rawChain = await eth.request({ method: "eth_chainId" });
            setChainId(parseChainId(rawChain));
          } catch {}
          const provider = new ethers.BrowserProvider(eth);
          updateBalance(accounts[0], provider);
        }
      };

      const handleChainChanged = async (hexChain: string) => {
        const newChainId = parseChainId(hexChain);
        setChainId(newChainId);

        try {
          const accounts = await eth.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            const provider = new ethers.BrowserProvider(eth);
            await updateBalance(accounts[0], provider);
          } else {
            setBotBalance("0.00");
          }
        } catch (error) {
          console.error("Failed to refresh balance after network change:", error);
          setBotBalance("0.00");
        }
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
          const rawChain = await eth.request({ method: "eth_chainId" });
          setChainId(parseChainId(rawChain));
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
        if (address) {
          const provider = new ethers.BrowserProvider(eth);
          await updateBalance(address, provider);
        }
        return true;
      } catch (switchError: any) {
        // If the chain hasn't been added to MetaMask (error 4902)
        if (
          switchError?.code === 4902 ||
          switchError?.data?.originalError?.code === 4902 ||
          switchError?.message?.includes("4902") ||
          switchError?.message?.includes("Unrecognized chain ID")
        ) {
          try {
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: config.hexChainId,
                  chainName: config.name,
                  nativeCurrency: {
                    name: config.currencySymbol,
                    symbol: config.currencySymbol,
                    decimals: 18,
                  },
                  rpcUrls: [config.rpcUrl],
                  blockExplorerUrls: [config.explorerUrl],
                },
              ],
            });
            setChainId(config.chainId);
            if (address) {
              const provider = new ethers.BrowserProvider(eth);
              await updateBalance(address, provider);
            }
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
        networkName: isDemoWallet ? "BOT Chain Mainnet (Demo)" : getNetworkName(chainId),
        targetConfig,
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
