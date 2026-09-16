"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  ExternalLink, 
  QrCode, 
  ArrowRight, 
  Wallet,
  Clock
} from "lucide-react";
import { useBOTSeat } from "@/lib/hooks/useBOTSeat";
import { useWallet } from "@/lib/hooks/useWallet";
import { TicketModal } from "@/components/tickets/TicketModal";
import { formatEventDate, formatAddress, getExplorerTxUrl } from "@/lib/config/botchain";
import { formatShortDate, generateReservationCode } from "@/lib/utils";
import { Reservation } from "@/types";

export default function ReservationsPage() {
  const { userReservations, isLoadingReservations, events } = useBOTSeat();
  const { isConnected, connectWallet, address } = useWallet();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const handleOpenTicket = (res: Reservation) => {
    setSelectedReservation(res);
    setIsTicketModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Reservations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access your event tickets, seat allocations, and verifiable QR codes on BOT Chain.
          </p>
        </div>

        {isConnected && address && (
          <div className="text-xs text-slate-500 font-medium">
            Wallet: <span className="font-mono text-slate-800 font-semibold">{formatAddress(address)}</span>
          </div>
        )}
      </div>

      {/* State 1: Wallet Not Connected */}
      {!isConnected ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-5 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Connect your wallet</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Connect the EVM wallet you used to reserve seats to load your on-chain tickets and QR codes.
            </p>
          </div>
          <button
            onClick={connectWallet}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : userReservations.length === 0 ? (
        /* State 2: Connected but No Reservations */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-5 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">No reservations yet</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              You haven&apos;t reserved a seat for any event on BOT Chain yet. Explore upcoming conferences to secure your spot.
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <span>Explore Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* State 3: Active Reservations Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userReservations.map((res) => {
            const linkedEvent = events.find((e) => e.id === res.eventId);
            const eventName = res.eventName || linkedEvent?.name || `Event #${res.eventId}`;
            const eventVenue = res.venue || linkedEvent?.venue || "Auditorium";
            const eventDate = res.dateTimestamp || linkedEvent?.dateTimestamp || res.reservedAt;

            return (
              <div
                key={res.reservationId}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-card transition-all flex flex-col justify-between"
              >
                {/* Top Section */}
                <div className="p-6 space-y-4">
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                      {generateReservationCode(res.reservationId)}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Confirmed</span>
                    </div>
                  </div>

                  {/* Title & Seat */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                      {eventName}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-xs text-slate-500">Reserved Seat:</span>
                      <span className="text-xl font-mono font-black text-slate-900">
                        {res.seatId}
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{formatShortDate(eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="line-clamp-1">{eventVenue}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
                  {res.txHash ? (
                    <a
                      href={getExplorerTxUrl(res.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium"
                    >
                      <span>Tx: {formatAddress(res.txHash)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">BOT Chain Verified</span>
                  )}

                  <button
                    onClick={() => handleOpenTicket(res)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View Ticket</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      {selectedReservation && (
        <TicketModal
          isOpen={isTicketModalOpen}
          onClose={() => {
            setIsTicketModalOpen(false);
            setSelectedReservation(null);
          }}
          reservation={selectedReservation}
          event={events.find((e) => e.id === selectedReservation.eventId)}
        />
      )}

    </div>
  );
}
