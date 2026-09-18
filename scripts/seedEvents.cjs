const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load env
const envLocalPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envLocalPath)) {
  require("dotenv").config({ path: envLocalPath });
} else {
  require("dotenv").config();
}

const rpcUrl = process.env.NEXT_PUBLIC_BOT_MAINNET_RPC || "https://rpc.botchain.ai";
const contractAddress = process.env.NEXT_PUBLIC_BOTSEAT_MAINNET_CONTRACT || "0xBA2e0b7CBcEFa99D846E9fDa4b30Ec18d4D3D66b";
const rawKey = (process.env.PRIVATE_KEY || "").trim();

const BOTSEAT_ABI = [
  "function getAllEvents() view returns (tuple(uint256 id, string name, string description, string venue, uint256 dateTimestamp, uint256 totalSeats, uint256 reservedCount, address organizer, string metadataURI, bool isActive)[])",
  "function createEvent(string name, string description, string venue, uint256 dateTimestamp, uint256 totalSeats, string metadataURI) returns (uint256)",
  "event EventCreated(uint256 indexed eventId, address indexed organizer, string name, string venue, uint256 dateTimestamp, uint256 totalSeats, string metadataURI)"
];

const INITIAL_EVENTS = [
  {
    name: "DevFest Ogbomoso 2026",
    description: "The largest developer and engineering gathering in Ogbomoso. Featuring technical deep dives into distributed systems, AI agents, mobile performance, and Web3 infrastructure.",
    venue: "LAUTECH Great Hall, Ogbomoso, Oyo State",
    dateTimestamp: Math.floor(new Date("2026-09-28T09:00:00Z").getTime() / 1000),
    totalSeats: 50,
    metadataURI: JSON.stringify({
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      category: "Developer Conference",
      timeString: "09:00 AM - 05:00 PM WAT",
      rows: 5,
      colsPerRow: 10,
    }),
  },
  {
    name: "Lagos Tech & AI Summit 2026",
    description: "Bringing together founders, AI researchers, and engineers building the next generation of autonomous intelligent software and verifiable compute.",
    venue: "Landmark Event Centre, Victoria Island, Lagos",
    dateTimestamp: Math.floor(new Date("2026-10-15T10:00:00Z").getTime() / 1000),
    totalSeats: 60,
    metadataURI: JSON.stringify({
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      category: "AI & Innovation",
      timeString: "10:00 AM - 06:00 PM WAT",
      rows: 6,
      colsPerRow: 10,
    }),
  },
  {
    name: "BOT Chain Builders Day",
    description: "Hands-on workshop and hack day for EVM developers deploying high-throughput smart contracts, oracles, and seat reservation protocols.",
    venue: "Zone Tech Park, Gbagada, Lagos",
    dateTimestamp: Math.floor(new Date("2026-11-05T11:00:00Z").getTime() / 1000),
    totalSeats: 40,
    metadataURI: JSON.stringify({
      image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
      category: "Workshop & Hackathon",
      timeString: "11:00 AM - 04:00 PM WAT",
      rows: 4,
      colsPerRow: 10,
    }),
  },
];

async function seed() {
  console.log("Connecting to BOT Chain Mainnet at:", rpcUrl);
  console.log("Target Contract Address:", contractAddress);

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const net = await provider.getNetwork();
  console.log("Verified Live Chain ID:", Number(net.chainId));

  if (!rawKey) {
    console.error("❌ No PRIVATE_KEY provided in .env.local.");
    return;
  }

  const wallet = new ethers.Wallet(rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`, provider);
  const walletAddr = await wallet.getAddress();
  const balance = await provider.getBalance(walletAddr);
  console.log("Signer Address:", walletAddr);
  console.log("Signer Balance:", ethers.formatEther(balance), "BOT");

  if (balance === 0n) {
    console.error("❌ Signer has 0 BOT balance to pay gas.");
    return;
  }

  const contract = new ethers.Contract(contractAddress, BOTSEAT_ABI, wallet);

  const existingEvents = await contract.getAllEvents();
  console.log(`Current On-Chain Events: ${existingEvents.length}`);

  if (existingEvents.length >= INITIAL_EVENTS.length) {
    console.log("✅ Events are already seeded on-chain!");
    for (const e of existingEvents) {
      console.log(`- Event ID: ${e.id} | Name: "${e.name}" | Total Seats: ${e.totalSeats}`);
    }
    return;
  }

  for (let i = existingEvents.length; i < INITIAL_EVENTS.length; i++) {
    const item = INITIAL_EVENTS[i];
    console.log(`\nCreating Event ${i + 1}: "${item.name}"...`);
    
    const gasEst = await contract.createEvent.estimateGas(
      item.name,
      item.description,
      item.venue,
      item.dateTimestamp,
      item.totalSeats,
      item.metadataURI
    );

    const tx = await contract.createEvent(
      item.name,
      item.description,
      item.venue,
      item.dateTimestamp,
      item.totalSeats,
      item.metadataURI,
      { gasLimit: (gasEst * 120n) / 100n }
    );

    console.log(`Tx broadcasted: ${tx.hash}. Waiting for confirmation...`);
    const receipt = await tx.wait();
    console.log(`✅ Event confirmed in block ${receipt.blockNumber}!`);
  }

  const updatedEvents = await contract.getAllEvents();
  console.log(`\n🎉 Total On-Chain Events Now: ${updatedEvents.length}`);
  for (const e of updatedEvents) {
    console.log(`- Event ID: ${e.id} | Name: "${e.name}" | Total Seats: ${e.totalSeats}`);
  }
}

seed().catch(console.error);
