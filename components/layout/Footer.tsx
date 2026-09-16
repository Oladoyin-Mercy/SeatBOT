import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                B
              </div>
              <span className="text-base font-bold text-slate-900">
                BOT<span className="text-blue-600">Seat</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              A simple, verifiable event seat reservation platform. Reserve your seat and receive digital tickets backed by BOT Chain.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero double-booking via smart contract verification</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/events" className="hover:text-slate-900 transition-colors">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-slate-900 transition-colors">
                  My Reservations
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-slate-900 transition-colors">
                  Verify Ticket
                </Link>
              </li>
              <li>
                <Link href="/organizer" className="hover:text-slate-900 transition-colors">
                  Organizer Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              About BOTSeat
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <span className="text-slate-600">Single-seat ownership protocol</span>
              </li>
              <li>
                <span className="text-slate-600">Direct wallet-to-seat allocation</span>
              </li>
              <li>
                <span className="text-slate-600">Instant digital QR pass generation</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom divider */}
        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BOTSeat. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Reserve your seat. Own your spot.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
