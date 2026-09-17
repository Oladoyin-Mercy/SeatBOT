BOTSeat — Blockchain Event Seat Reservation Platform


**BOTSeat** is a decentralized, tamper-proof event ticketing and interactive seating reservation dApp built on **BOT Chain**. It provides cryptographic guarantees against double-booking, generates verifiable QR code tickets, and offers a smooth, real-time visual seat map experience for attendees and organizers.

---

## ✨ Features

- ** Zero Double-Booking Guarantee:** Seat reservations are strictly recorded and validated on-chain via smart contract logic, rendering duplicate bookings mathematically impossible.
- **Interactive Seating Map:** Visual, color-coded seat selection grid with live status indicators (Available, Selected, Reserved, VIP/Regular tiers).
- **🎟️ Verifiable QR Code Tickets:** Generates cryptographic ticket proofs directly accessible in the user dashboard with scannable QR verification codes.
- **⚡ Gatekeeper / Scanner Portal (`/verify`):** Real-time on-chain ticket verifier for event staff and gatekeepers to validate attendee tickets at venue entrances.
- ** Organizer Studio (`/organizer`):** Dedicated organizer dashboard for publishing new events, tracking real-time venue occupancy, and monitoring ticket sales.


---

# Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js](https://nextjs.org/) (App Router, Server & Client Components) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), Lucide Icons, Canvas Confetti |
| **Web3 & Blockchain** | [Ethers.js v6](https://docs.ethers.org/v6/), Web3 Browser Provider |
| **Smart Contracts** | [Solidity 0.8.20](https://soliditylang.org/) with custom gas-efficient errors & mappings |
| **Contract Tooling** | [Hardhat](https://hardhat.org/), Chai, Mocha |
| **Ticket Verification** | [qrcode.react](https://www.npmjs.com/package/qrcode.react), cryptographic payload hashing |

---

## ⛓️ BOT Chain Network Configurations

| Parameter | Mainnet | Testnet |
| :--- | :--- | :--- |
| **Network Name** | BOT Chain Mainnet | BOT Chain Testnet |
| **Chain ID** | `677` (`0x2a5`) | `968` (`0x3c8`) |
| **RPC URL** | `https://rpc.botchain.ai` | `https://rpc.bohr.life` |
| **Currency Symbol** | `BOT` | `BOT` |
| **Block Explorer** | [scan.botchain.ai](https://scan.botchain.ai) | [scan.bohr.life](https://scan.bohr.life) |
| **Deployed Contract** | `0x9183c90302e9b5658e381016f4d4f80918c1d677` | `0x742d35Cc6634C0532925a3b844Bc454e4438f44e` |

---

## 📁 Repository Structure

```
SeatBOT/
├── app/                        # Next.js App Router Pages
│   ├── events/[id]/            # Event Detail & Interactive Seat Map Page
│   ├── organizer/              # Organizer Dashboard
│   │   └── create/             # Event Creation Form
│   ├── reservations/           # Attendee Tickets & Reservation History
│   ├── verify/                 # QR Ticket Scanner & Verifier
│   ├── layout.tsx              # Root Layout & Global Navigation
│   └── page.tsx                # Homepage & Featured Event Catalog
├── components/                 # Reusable UI & Web3 Components
│   ├── events/                 # Event Cards, Filter Badges, Detail Modals
│   ├── layout/                 # Navbar, Footer, Network Switcher, Wallet Modal
│   ├── reservation/            # Interactive Seat Grid & Checkout Summary
│   └── tickets/                # Scannable Ticket Pass & QR Modal
├── contracts/                  # Smart Contracts
│   └── BOTSeat.sol             # Core BOTSeat Solidity Contract
├── lib/                        # Utilities, Hooks, and Blockchain Services
│   ├── config/                 # Chain & Contract Configurations
│   ├── contracts/              # ABI & Contract Factory Helpers
│   ├── hooks/                  # Custom React Hooks (useWallet, useBOTSeat)
│   └── utils.ts                # Formatting, address masking & helper functions
├── test/                       # Hardhat Contract Tests
│   └── BOTSeat.test.js         # Comprehensive unit tests
├── hardhat.config.js           # Hardhat Configuration for BOT Chain
├── package.json                # Project Dependencies & Scripts
└── tsconfig.json               # TypeScript Configuration
```

---

## 📜 Smart Contract Overview (`BOTSeat.sol`)

The `BOTSeat.sol` smart contract orchestrates all core on-chain state transitions:

- **`createEvent(name, description, venue, dateTimestamp, totalSeats, metadataURI)`**: Creates an event with designated seat capacity and metadata.
- **`reserveSeat(eventId, seatId)`**: Atomically reserves an available seat for the caller. Reverts with `SeatAlreadyReserved` if already taken.
- **`cancelReservation(reservationId)`**: Enables ticket holders to release their seat prior to event start.
- **`verifyReservation(reservationId, eventId, seatId, attendee)`**: Validates whether a given ticket/reservation is active and authentic.
- **`getEventReservedSeats(eventId)`**: Returns a string array of all currently occupied seat identifiers (e.g. `["A01", "A02", "B15"]`).
- **`getUserReservations(attendee)`**: Fetches all reservations tied to a specific wallet.

---

## 🚀 Quick Start Guide

### 1. Prerequisites

- **Node.js**: `v18.18.0` or higher
- **npm** or **pnpm** / **yarn**
- **MetaMask** or compatible EVM browser wallet with BOT Chain added.

### 2. Clone and Install Dependencies

```bash
git clone https://github.com/your-username/SeatBOT.git
cd SeatBOT
npm install
```

### 3. Configure Environment Variables

Copy the template environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` to verify or update your RPC and Contract addresses:

```env
# BOT Chain Mainnet (Chain ID 677)
NEXT_PUBLIC_BOTSEAT_MAINNET_CONTRACT="0x9183c90302e9b5658e381016f4d4f80918c1d677"
NEXT_PUBLIC_BOT_MAINNET_RPC="https://rpc.botchain.ai"

# BOT Chain Testnet (Chain ID 968)
NEXT_PUBLIC_BOTSEAT_TESTNET_CONTRACT="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
NEXT_PUBLIC_BOT_TESTNET_RPC="https://rpc.bohr.life"

# (Optional) Deployer Private Key for Hardhat Scripts
PRIVATE_KEY=""
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience the application.

---

## 🧪 Smart Contract Testing & Deployment

### Run Unit Tests

Execute the Hardhat test suite to verify contract security and double-booking logic:

```bash
npx hardhat test
```

### Compile Smart Contracts

```bash
npx hardhat compile
```

### Deploy to BOT Chain

To deploy the smart contract to BOT Chain Testnet or Mainnet:

```bash
# Deploy to BOT Chain Testnet (Chain ID 968)
npx hardhat run scripts/deploy.js --network botchainTestnet

# Deploy to BOT Chain Mainnet (Chain ID 677)
npx hardhat run scripts/deploy.js --network botchainMainnet
```

---

## 💡 User Flows

### 1. Reserving a Seat (Attendee)
1. Connect your MetaMask wallet.
2. Ensure you are on **BOT Chain** (the app provides a one-click network switch prompt).
3. Browse events on the homepage and click on an event.
4. Select your preferred seat from the interactive seating grid.
5. Click **Confirm Reservation** and sign the on-chain transaction.
6. Once mined, navigate to **My Tickets** to view your verified QR pass.

### 2. Creating an Event (Organizer)
1. Connect your wallet and navigate to `/organizer/create`.
2. Enter event details: Name, Description, Venue, Date & Time, Capacity, and Banner Image.
3. Submit the transaction to deploy the event configuration on-chain.
4. Manage attendee count and seat occupancy from your **Organizer Dashboard**.

### 3. Verifying Tickets at the Gate (Gatekeeper)
1. Open the `/verify` portal on any mobile device or laptop.
2. Scan the attendee's ticket QR code or manually enter the Reservation ID, Event ID, and Attendee Wallet.
3. The app queries the smart contract and displays instant verification status (**VALID**, **CANCELLED**, or **INVALID**).

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
