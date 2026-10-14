# SeatBOT — Decentralized Event Seat Reservation Platform

SeatBOT is a decentralized, verifiable event seat reservation and digital ticketing platform built on **BOT Chain**. It provides cryptographic guarantees against double-booking, real-time interactive seat layouts, verifiable on-chain digital tickets with scannable QR codes, and a dedicated gatekeeper verification portal.

---

## ⛓️ Deployed Contracts & Networks

SeatBOT is deployed on **both BOT Chain Mainnet and Testnet**:

| Parameter | BOT Chain Mainnet | BOT Chain Testnet |
| :--- | :--- | :--- |
| **Network Name** | BOT Chain Mainnet | BOT Chain Testnet |
| **Chain ID** | `677` (`0x2a5`) | `968` (`0x3c8`) |
| **RPC URL** | `https://rpc.botchain.ai` | `https://rpc.bohr.life` |
| **Currency** | `BOT` | `BOT` |
| **Contract Address** | [`0xBA2e0b7CBcEFa99D846E9fDa4b30Ec18d4D3D66b`](https://scan.botchain.ai/address/0xBA2e0b7CBcEFa99D846E9fDa4b30Ec18d4D3D66b) | [`0x52208ddadD40b8A3e1C12B064c43a043dfFFd25D`](https://scan.bohr.life/address/0x52208ddadD40b8A3e1C12B064c43a043dfFFd25D) |
| **Block Explorer** | [scan.botchain.ai](https://scan.botchain.ai) | [scan.bohr.life](https://scan.bohr.life) |
| **Deployer Address** | `0xD21984aFbcDC85Be0bd97eFAeE82C7d587dD1112` | `0xD21984aFbcDC85Be0bd97eFAeE82C7d587dD1112` |
| **Deployment Tx** | `0x3372a29de3e91038bbeb8fb2a48d8d638270e94b0d7a515650dd8f5bc275b0c4` | `0x57cd676dab33a2e1ffc61ce5a64c0a7dbf6f693d78c95412f2787d63c6b5f2db` |

---

## ✨ Features

- **🛡️ Zero Double-Booking Guarantee:** Every seat reservation is atomic and enforced on-chain. Two transactions attempting to reserve the same seat cannot both succeed.
- **🗺️ Interactive Seating Grid:** Visual venue seat selection matrix with live occupancy states (Available, Selected, Reserved).
- **🎟️ Verifiable QR Digital Passes:** Generates instant cryptographic ticket proofs that can be added to your reservations wallet and displayed as scannable passes.
- **🔍 Gatekeeper Verification Portal (`/verify`):** Real-time on-chain ticket verification interface for event staff and venue security to scan and validate tickets at entry gates.
- **⚡ Organizer Studio (`/organizer`):** Create and configure on-chain events with custom seat capacities, venue details, and track live attendee occupancy.
- **💳 Multi-Network & Wallet Support:** Connect with MetaMask or any EVM wallet with automatic network switching and fallback sandbox demo mode.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Web3 Client** | [Ethers.js v6](https://docs.ethers.org/v6/) |
| **Smart Contract** | [Solidity 0.8.20](https://soliditylang.org/) with custom gas-efficient errors & mappings |
| **Development & Testing** | [Hardhat](https://hardhat.org/), Chai, Mocha |
| **QR Code Verification** | [qrcode.react](https://www.npmjs.com/package/qrcode.react) |

---

## 📁 Repository Structure

```text
SeatBOT/
├── app/                        # Next.js App Router
│   ├── events/                 # Event discovery & detail pages
│   │   └── [id]/               # Interactive seat grid & reservation modal
│   ├── organizer/              # Organizer dashboard
│   │   └── create/             # Event creation form
│   ├── reservations/           # Attendee tickets & reservation history
│   ├── verify/                 # Gatekeeper QR scanner & on-chain verifier
│   ├── layout.tsx              # Root layout & providers
│   └── page.tsx                # Landing page & featured events
├── components/                 # React UI components
│   ├── events/                 # EventCard, EventFilters, etc.
│   ├── layout/                 # Navbar, Footer
│   ├── reservation/            # Seat grid, reservation dialogs
│   └── tickets/                # Scannable ticket modal & pass
├── contracts/                  # Solidity smart contracts
│   └── BOTSeat.sol             # Core smart contract
├── deployments/                # Deployment history & artifacts
│   ├── botchainMainnet.json    # Mainnet deployment metadata
│   └── botchainTestnet.json    # Testnet deployment metadata
├── lib/                        # Client libraries & hooks
│   ├── config/botchain.ts      # Chain RPC & contract addresses
│   ├── contracts/              # ABI definitions & factory helpers
│   ├── hooks/                  # useWallet, useBOTSeat
│   └── services/               # Blockchain read/write service
├── scripts/                    # Automation scripts
│   ├── deploy.cjs              # Hardhat deployment script
│   └── seedEvents.cjs          # Initial event seeding script
├── test/                       # Smart contract test suite
│   └── BOTSeat.test.cjs        # Unit & integration tests
├── hardhat.config.cjs          # Hardhat configuration
├── package.json
└── tsconfig.json
```

---

## 📜 Smart Contract Overview (`BOTSeat.sol`)

The `BOTSeat.sol` smart contract manages all event, reservation, and verification logic:

- `createEvent(name, description, venue, dateTimestamp, totalSeats, metadataURI)`: Creates an event with designated seat capacity and metadata.
- `reserveSeat(eventId, seatId)`: Atomically reserves an available seat. Reverts if already booked.
- `cancelReservation(reservationId)`: Allows ticket holders to release their seat before event start.
- `verifyReservation(reservationId, eventId, seatId, attendee)`: Gatekeeper verification function to check ticket validity.
- `getEventReservedSeats(eventId)`: Returns an array of all currently booked seat IDs.
- `getUserReservations(attendee)`: Returns all reservation IDs owned by a specific address.
- `getAllEvents()`: Fetches all events with active status and real-time reservation counts.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18.0 or newer)
- npm, pnpm, or yarn
- MetaMask or any EVM-compatible browser wallet

### 1. Installation

```bash
git clone https://github.com/Oladoyin-Mercy/SeatBOT.git
cd SeatBOT
npm install
```

### 2. Environment Setup

Create `.env.local` from the example template:

```bash
cp .env.example .env.local
```

Verify your `.env.local` contains the deployed addresses:

```env
# BOT Chain Mainnet (Chain ID 677)
NEXT_PUBLIC_BOTSEAT_MAINNET_CONTRACT="0xBA2e0b7CBcEFa99D846E9fDa4b30Ec18d4D3D66b"
NEXT_PUBLIC_BOT_MAINNET_RPC="https://rpc.botchain.ai"

# BOT Chain Testnet (Chain ID 968)
NEXT_PUBLIC_BOTSEAT_TESTNET_CONTRACT="0x52208ddadD40b8A3e1C12B064c43a043dfFFd25D"
NEXT_PUBLIC_BOT_TESTNET_RPC="https://rpc.bohr.life"

# Deployer Private Key (Optional, for deploying/seeding)
PRIVATE_KEY=""
```

### 3. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Smart Contract Operations

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm run test:contracts
```

### Deploy Contracts
```bash
# Deploy to BOT Chain Testnet (Chain ID 968)
npx hardhat run scripts/deploy.cjs --network botchainTestnet

# Deploy to BOT Chain Mainnet (Chain ID 677)
npm run deploy:mainnet
```

### Seed Demo Events
```bash
node scripts/seedEvents.cjs
```

---

## 🎟️ Verification Flow for Gatekeepers

1. Navigate to `/verify` in your browser.
2. Either scan the attendee's ticket QR code using your device camera or enter their Reservation ID, Event ID, and Wallet Address.
3. The application performs a live smart contract call to confirm ticket authenticity and displays the result (**VALID**, **CANCELLED**, or **INVALID**).

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
