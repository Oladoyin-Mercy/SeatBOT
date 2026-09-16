import { NetworkConfig, NetworkType } from "@/types";

export const BOT_CHAIN_CONFIG: Record<NetworkType, NetworkConfig> = {
  mainnet: {
    chainId: 677,
    hexChainId: "0x2a5",
    name: "BOT Chain Mainnet",
    rpcUrl: process.env.NEXT_PUBLIC_BOT_MAINNET_RPC || "https://rpc.botchain.ai",
    currencySymbol: "BOT",
    explorerUrl: "https://scan.botchain.ai",
    contractAddress: process.env.NEXT_PUBLIC_BOTSEAT_MAINNET_CONTRACT || "0x9183c90302e9b5658e381016f4d4f80918c1d677",
  },
  testnet: {
    chainId: 968,
    hexChainId: "0x3c8",
    name: "BOT Chain Testnet",
    rpcUrl: process.env.NEXT_PUBLIC_BOT_TESTNET_RPC || "https://rpc.bohr.life",
    currencySymbol: "BOT",
    explorerUrl: "https://scan.bohr.life",
    contractAddress: process.env.NEXT_PUBLIC_BOTSEAT_TESTNET_CONTRACT || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  },
};

export const DEFAULT_NETWORK: NetworkType = "mainnet";

export function getNetworkConfig(network: NetworkType = DEFAULT_NETWORK): NetworkConfig {
  return BOT_CHAIN_CONFIG[network] || BOT_CHAIN_CONFIG.mainnet;
}

export function formatAddress(address?: string | null): string {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatTxHash(txHash?: string | null): string {
  if (!txHash) return "";
  if (txHash.length <= 14) return txHash;
  return `${txHash.substring(0, 8)}...${txHash.substring(txHash.length - 6)}`;
}

export function getExplorerTxUrl(txHash: string, network: NetworkType = DEFAULT_NETWORK): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string, network: NetworkType = DEFAULT_NETWORK): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/address/${address}`;
}

export function formatEventDate(timestamp: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
