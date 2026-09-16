import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/lib/hooks/useWallet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "BOTSeat — Event Seat Reservation Platform on BOT Chain",
  description:
    "A simple, verifiable way to reserve event seats and receive authentic digital tickets powered by BOT Chain.",
  openGraph: {
    title: "BOTSeat — Reserve your seat. Own your spot.",
    description:
      "A simple, verifiable way to reserve event seats and receive authentic digital tickets powered by BOT Chain.",
    type: "website",
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
