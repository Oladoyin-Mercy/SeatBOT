# BOTSeat — Launch Notes

## 🚀 Official Launch

**Officially launched on BOT Chain Mainnet.**

---

## Deployment Details

| Field | Value |
| :--- | :--- |
| **Network** | BOT Chain Mainnet |
| **Chain ID** | `677` (`0x2a5`) |
| **RPC URL** | `https://rpc.botchain.ai` |
| **Block Explorer** | [scan.botchain.ai](https://scan.botchain.ai) |
| **BOT Chain Website** | [botchain.ai](https://botchain.ai) |
| **Deployed Contract** | `0xBA2e0b7CBcEFa99D846E9fDa4b30Ec18d4D3D66b` |
| **Launch Date** | September 2026 |

---

## What is BOTSeat?

BOTSeat is a decentralized, tamper-proof event seat reservation platform built on BOT Chain. It enables:

- **Zero double-booking** — seat reservations are validated and locked on-chain, making duplicate bookings mathematically impossible.
- **Permissionless event creation** — any wallet connected to BOT Chain Mainnet can create an event. No admin approval, no special role required. The creating wallet is automatically recorded as the event organizer on-chain.
- **Free seat reservations** — attendees pay only the standard BOT Chain network gas fee. Reservation itself is free.
- **Verifiable QR code tickets** — digital tickets with scannable QR codes backed by on-chain data.
- **Instant ticket verification** — the `/verify` portal allows event staff to validate tickets on-chain in real time.

---

## Network Safety

BOTSeat targets **BOT Chain Mainnet exclusively** (Chain ID `677`). The application:

- Detects the connected network on every transaction.
- Warns users if they are on a testnet or wrong chain.
- Provides a one-click "Switch to BOT Chain Mainnet" option.
- Blocks transactions from being submitted to the wrong chain.

---

## Security Notes

- No private keys are stored in or exposed by the frontend.
- Deployer keys are only used via Hardhat scripts and are never imported into the Next.js application.
- `.env.local` is git-ignored and must never be committed.
- All reservation and event creation transactions require explicit wallet signing by the user.

---

*BOTSeat — Reserve your seat. Own your spot. Verified on BOT Chain.*
