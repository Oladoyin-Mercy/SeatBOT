require("@nomicfoundation/hardhat-toolbox");
const path = require("path");
const fs = require("fs");

// Load .env.local first if it exists, otherwise fallback to .env
const envLocalPath = path.resolve(__dirname, ".env.local");
if (fs.existsSync(envLocalPath)) {
  require("dotenv").config({ path: envLocalPath });
} else {
  require("dotenv").config();
}

const rawKey = (process.env.PRIVATE_KEY || "").trim();
// A valid EVM private key is 32 bytes (64 hex characters without 0x prefix, or 66 with 0x)
const isValidPrivateKey = /^(0x)?[0-9a-fA-F]{64}$/.test(rawKey);
const accounts = isValidPrivateKey
  ? [rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`]
  : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    botchainMainnet: {
      url: process.env.NEXT_PUBLIC_BOT_MAINNET_RPC || "https://rpc.botchain.ai",
      chainId: 677,
      accounts: accounts,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
