import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/lib/hooks/useWallet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "BOTSeat — Event Seat Reservation on BOT Chain Mainnet",
  description:
    "Reserve event seats on BOT Chain Mainnet. Cryptographic single-seat ownership, zero double-booking, and instant verifiable QR tickets. Any connected BOT Chain wallet can create or attend events.",
  keywords: ["BOTSeat", "BOT Chain", "blockchain tickets", "event reservation", "decentralized ticketing", "seat reservation", "BOT Chain Mainnet"],
  authors: [{ name: "BOTSeat" }],
  robots: "index, follow",
  openGraph: {
    title: "BOTSeat — Reserve your seat. Own your spot.",
    description:
      "Decentralized event seat reservation on BOT Chain Mainnet. Zero double-booking. Free reservations. Verifiable QR tickets.",
    type: "website",
    siteName: "BOTSeat",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BOTSeat — Reserve your seat. Own your spot.",
    description:
      "Decentralized event seat reservation on BOT Chain Mainnet. Zero double-booking. Verifiable on-chain tickets.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col bg-[#fafafa] text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <WalletProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
