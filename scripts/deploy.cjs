const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=================================================");
  console.log("   BOTSeat Smart Contract Deployment Process     ");
  console.log("=================================================\n");

  // ==============================================================
  // 1. HARD STOP ON WRONG NETWORK (Name & Config Chain ID)
  // ==============================================================
  const currentNetwork = network.name;
  if (currentNetwork !== "botchainMainnet") {
    console.error(`\n❌ HARD STOP: Target network is '${currentNetwork}'.`);
    console.error(`Deployment aborted. Network MUST strictly be 'botchainMainnet'.`);
    console.error(`Execution command must be: npx hardhat run scripts/deploy.cjs --network botchainMainnet`);
    process.exit(1);
  }

  const configChainId = Number(network.config.chainId);
  if (configChainId !== 677) {
    console.error(`\n❌ HARD STOP: Hardhat config chainId is ${configChainId}, expected exactly 677.`);
    console.error(`Deployment aborted. Chain ID must strictly be 677 for BOT Chain Mainnet.`);
    process.exit(1);
  }

  // ==============================================================
  // 2. VERIFY THE ACTUAL RPC CHAIN ID (Live on-chain query)
  // ==============================================================
  console.log("Querying connected RPC endpoint for live network verification...");
  let liveRpcChainId;
  try {
    const providerNetwork = await ethers.provider.getNetwork();
    liveRpcChainId = Number(providerNetwork.chainId);
  } catch (rpcErr) {
    console.error(`\n❌ HARD STOP: Failed to query RPC node at ${network.config.url || "default"}:`, rpcErr.message);
    console.error(`Deployment aborted.`);
    process.exit(1);
  }

  console.log(`- Hardhat Network Name   : ${currentNetwork}`);
  console.log(`- Configured Chain ID    : ${configChainId}`);
  console.log(`- Live RPC Chain ID      : ${liveRpcChainId}`);
  console.log(`- RPC URL                : ${network.config.url}`);

  if (liveRpcChainId !== 677) {
    console.error(`\n❌ HARD STOP: Connected RPC returned Chain ID ${liveRpcChainId}, expected exactly 677.`);
    console.error(`Deployment aborted. The RPC node is NOT BOT Chain Mainnet.`);
    process.exit(1);
  }

  console.log("\n✅ Network verification PASSED: Confirmed BOT Chain Mainnet (Chain ID 677).\n");

  // ==============================================================
  // 3. DEPLOYER WALLET & BALANCE VALIDATION
  // ==============================================================
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    console.error("❌ HARD STOP: No deployer account loaded!");
    console.error("Please ensure PRIVATE_KEY (32-byte hex) is configured in your .env.local file.");
    process.exit(1);
  }

  const deployer = signers[0];
  const deployerAddress = await deployer.getAddress();
  const balanceWei = await ethers.provider.getBalance(deployerAddress);
  const balanceBOT = ethers.formatEther(balanceWei);

  console.log(`- Deployer Address       : ${deployerAddress}`);
  console.log(`- Deployer Balance       : ${balanceBOT} BOT`);

  if (balanceWei === 0n) {
    console.error(`\n❌ HARD STOP: Deployer wallet ${deployerAddress} has 0 BOT balance on Mainnet.`);
    console.error("Please fund your wallet with BOT tokens to cover deployment gas fees.");
    process.exit(1);
  }

  // ==============================================================
  // 4. SMART CONTRACT DEPLOYMENT
  // ==============================================================
  console.log("\nDeploying BOTSeat smart contract to BOT Chain Mainnet...");
  const BOTSeatFactory = await ethers.getContractFactory("BOTSeat");
  
  const botSeat = await BOTSeatFactory.deploy();
  console.log("Deployment transaction broadcasted. Waiting for on-chain block confirmation...");
  
  await botSeat.waitForDeployment();
  const contractAddress = await botSeat.getAddress();
  const deployTx = botSeat.deploymentTransaction();

  console.log("\n=================================================");
  console.log("🎉 BOTSeat CONTRACT DEPLOYED SUCCESSFULLY TO MAINNET!");
  console.log("=================================================");
  console.log(`Contract Address : ${contractAddress}`);
  console.log(`Transaction Hash : ${deployTx ? deployTx.hash : "N/A"}`);
  console.log(`Block Explorer   : https://scan.botchain.ai/address/${contractAddress}`);
  console.log("=================================================\n");

  // ==============================================================
  // 5. SAVE DEPLOYMENT ARTIFACT
  // ==============================================================
  const deploymentsDir = path.resolve(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentInfo = {
    network: currentNetwork,
    chainId: liveRpcChainId,
    rpcUrl: network.config.url,
    contractAddress: contractAddress,
    deployer: deployerAddress,
    txHash: deployTx ? deployTx.hash : null,
    deployedAt: new Date().toISOString(),
  };

  const deploymentFilePath = path.join(deploymentsDir, `${currentNetwork}.json`);
  fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📁 Mainnet deployment record saved to: ${path.relative(process.cwd(), deploymentFilePath)}`);

  console.log("\nNext Steps:");
  console.log(`1. Update NEXT_PUBLIC_BOTSEAT_MAINNET_CONTRACT in .env.local:`);
  console.log(`   NEXT_PUBLIC_BOTSEAT_MAINNET_CONTRACT="${contractAddress}"`);
  console.log(`2. Verify the contract address in lib/config/botchain.ts`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment terminated with error:", error);
    process.exit(1);
  });
