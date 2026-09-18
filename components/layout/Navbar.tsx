"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/lib/hooks/useWallet";
import { formatAddress } from "@/lib/config/botchain";
import { 
  Ticket, 
  Search, 
  QrCode, 
  PlusCircle, 
  Menu, 
  X, 
  ChevronDown, 
  Copy, 
  LogOut, 
  Check, 
  ShieldCheck,
  Circle
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { 
    address, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    botBalance,
    isDemoWallet,
    isCorrectNetwork,
    switchNetwork,
    networkName,
  } = useWallet();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    try {
      await switchNetwork("mainnet");
    } finally {
      setIsSwitching(false);
    }
  };

  const navLinks = [
    { href: "/events", label: "Explore Events", icon: Search },
    { href: "/reservations", label: "My Reservations", icon: Ticket },
    { href: "/verify", label: "Verify Ticket", icon: QrCode },
    { href: "/organizer", label: "Organizer Hub", icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm group-hover:bg-blue-600 transition-colors">
                B
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                BOT<span className="text-blue-600 font-extrabold">Seat</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-slate-900 bg-slate-100/80 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action: Wallet Button */}
          <div className="hidden md:flex items-center gap-3">

            {/* Network Indicator when connected */}
            {isConnected && (
              isCorrectNetwork ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 text-emerald-700 rounded-lg text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>BOT Chain Mainnet</span>
                </div>
              ) : (
                <button
                  onClick={handleSwitchNetwork}
                  disabled={isSwitching}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95"
                  title="Your wallet is on a different network. Click to switch to BOT Chain Mainnet."
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>{isSwitching ? "Switching..." : "Switch to BOT Chain"}</span>
                </button>
              )
            )}

            {/* Wallet Button */}
            {!isConnected ? (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-70"
              >
                {isConnecting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  "Connect Wallet"
                )}
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 text-sm font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors"
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="font-mono text-xs font-semibold text-slate-900">
                      {formatAddress(address)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {botBalance} BOT
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown menu */}
                {isWalletDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-modal border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Connected Wallet</p>
                      <p className="font-mono text-xs font-semibold text-slate-900 break-all mt-0.5">
                        {address}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Network:</span>
                        <span className={`font-semibold ${isCorrectNetwork ? "text-emerald-600" : "text-amber-600"}`}>
                          {networkName}
                        </span>
                      </div>
                      {isCorrectNetwork && !isDemoWallet && (
                        <div className="mt-1 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Chain ID:</span>
                          <span className="font-mono font-semibold text-slate-600">677</span>
                        </div>
                      )}
                      {isDemoWallet && (
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                          Demo Sandbox Mode
                        </span>
                      )}
                    </div>

                    {!isCorrectNetwork && !isDemoWallet && (
                      <div className="px-3 py-1.5 border-b border-slate-100">
                        <button
                          onClick={handleSwitchNetwork}
                          disabled={isSwitching}
                          className="w-full py-1.5 px-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          Switch to BOT Chain Mainnet
                        </button>
                      </div>
                    )}

                    <div className="py-1">
                      <button
                        onClick={handleCopy}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copied ? "Copied address" : "Copy Address"}</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setIsWalletDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg"
              >
                Connect
              </button>
            ) : (
              <span className="text-xs font-mono font-medium px-2 py-1 bg-slate-100 rounded text-slate-800">
                {formatAddress(address)}
              </span>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                {link.label}
              </Link>
            );
          })}
          
        </div>
      )}
    </header>
  );
};
