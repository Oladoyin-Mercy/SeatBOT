"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  ArrowLeft, 
  ExternalLink,
  Share2,
  Check
} from "lucide-react";
import { useBOTSeat } from "@/lib/hooks/useBOTSeat";
import { useWallet } from "@/lib/hooks/useWallet";
import { ReservationModal } from "@/components/reservation/ReservationModal";
import { TicketModal } from "@/components/tickets/TicketModal";
import { formatEventDate, formatAddress, getExplorerAddressUrl } from "@/lib/config/botchain";
import { blockchainService } from "@/lib/services/blockchain";
import { BOTEvent, Reservation } from "@/types";

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = parseInt(resolvedParams.id, 10);

  const { events, reserveSeat, txState, resetTxState, userReservations } = useBOTSeat();
  const { isConnected, address, connectWallet } = useWallet();

  const [currentEvent, setCurrentEvent] = useState<BOTEvent | null>(null);
  const [reservedSeats, setReservedSeats] = useState<string[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [customSeatInput, setCustomSeatInput] = useState<string>("");
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [activeTicketReservation, setActiveTicketReservation] = useState<Reservation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load event details and reserved seats
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Find in events hook or query service
        const found = events.find((e) => e.id === eventId);
        if (found) {
          setCurrentEvent(found);
        } else {
          const fetched = await blockchainService.fetchEventById(eventId);
          if (fetched) setCurrentEvent(fetched);
        }

        // Fetch reserved seats
        const seats = await blockchainService.fetchReservedSeats(eventId);
        
        // Also check any locally recorded reserved seats for this event
        if (typeof window !== "undefined") {
          const seatKey = `botseat_event_${eventId}_reserved_seats`;
          const localSeatsStr = localStorage.getItem(seatKey);
          const localSeats: string[] = localSeatsStr ? JSON.parse(localSeatsStr) : [];
          const combined = Array.from(new Set([...seats, ...localSeats]));
          setReservedSeats(combined);
        } else {
          setReservedSeats(seats);
        }
      } catch (err) {
        console.error("Failed to load event data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [eventId, events]);

  // Find user's own reservations for this event
  const userEventReservations = userReservations.filter((r) => r.eventId === eventId && !r.isCancelled);

  const availableSeats = currentEvent ? Math.max(0, currentEvent.totalSeats - reservedSeats.length) : 0;

  // Compute next available seat code automatically
  const nextAvailableSeat = useMemo(() => {
    if (!currentEvent) return "A01";
    for (let i = 1; i <= currentEvent.totalSeats; i++) {
      const rowChar = String.fromCharCode(65 + Math.floor((i - 1) / 10));
      const num = ((i - 1) % 10) + 1;
      const seatCode = `${rowChar}${String(num).padStart(2, "0")}`;
      if (!reservedSeats.includes(seatCode)) {
        return seatCode;
      }
    }
    return `Seat-${reservedSeats.length + 1}`;
  }, [currentEvent, reservedSeats]);

  const activeSeatId = selectedSeat || nextAvailableSeat;
  const isSeatTaken = reservedSeats.includes(activeSeatId);

  const handleOpenReserveModal = () => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    if (!activeSeatId || isSeatTaken) return;
    setIsReservationModalOpen(true);
  };

  const handleConfirmReservation = async () => {
    if (!currentEvent || !activeSeatId) return;
    const success = await reserveSeat(currentEvent, activeSeatId);
    if (success) {
      setReservedSeats((prev) => [...prev, activeSeatId]);
    }
  };

  const handleViewTicketFromModal = (resId: number) => {
    setIsReservationModalOpen(false);
    
    // Find reservation object
    const createdRes: Reservation = {
      reservationId: resId,
      eventId: currentEvent?.id || eventId,
      seatId: activeSeatId || "A01",
      attendee: address || "0x0",
      reservedAt: Math.floor(Date.now() / 1000),
      isCancelled: false,
      eventName: currentEvent?.name,
      venue: currentEvent?.venue,
      dateTimestamp: currentEvent?.dateTimestamp,
      txHash: txState.txHash || undefined,
    };
    
    setActiveTicketReservation(createdRes);
    setIsTicketModalOpen(true);
    setSelectedSeat(null);
    setCustomSeatInput("");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading && !currentEvent) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Querying event details from BOT Chain...</p>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Event not found</h2>
        <p className="text-xs text-slate-500">The event you are looking for does not exist on BOT Chain.</p>
        <Link href="/events" className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Link and Header actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copiedLink ? "Link Copied" : "Share Event"}</span>
        </button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Event Metadata & Details */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Event Banner Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="relative h-60 w-full bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentEvent.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"}
                alt={currentEvent.name}
                className="w-full h-full object-cover"
              />
              {currentEvent.category && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-xs rounded-full text-xs font-bold text-slate-800 shadow-sm border border-slate-200">
                  {currentEvent.category}
                </div>
              )}
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                  {currentEvent.name}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span>Organizer:</span>
                  <a
                    href={getExplorerAddressUrl(currentEvent.organizer)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                  >
                    <span>{formatAddress(currentEvent.organizer)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Event Time & Venue Details */}
              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {formatEventDate(currentEvent.dateTimestamp)}
                    </span>
                    <span className="text-slate-500">{currentEvent.timeString || "09:00 AM - 05:00 PM WAT"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Venue</span>
                    <span className="text-slate-600">{currentEvent.venue}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div>
                    <span className="font-semibold text-slate-900 block">Registration Model</span>
                    <span className="text-slate-600">
  Free reservation — network gas only
</span>
                  </div>
                </div>
              </div>

              {/* Capacity Stats Breakdown */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Seats</span>
                  <span className="text-sm font-bold text-slate-900">{currentEvent.totalSeats}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Reserved</span>
                  <span className="text-sm font-bold text-slate-900">{reservedSeats.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Available</span>
                  <span className="text-sm font-bold text-emerald-600">{availableSeats}</span>
                </div>
              </div>

              {/* Event Full Description */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  About this Event
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {currentEvent.description}
                </p>
              </div>

              {/* Notice */}
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-2 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  Seats are guaranteed and locked to your wallet upon transaction confirmation on BOT Chain.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Direct Seat Reservation Card */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* User's existing tickets for this event if any */}
          {userEventReservations.length > 0 && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">You have a reserved seat for this event!</h4>
                  <p className="text-[11px] text-emerald-800">
                    Reserved Seat: <strong className="font-mono">{userEventReservations.map(r => r.seatId).join(", ")}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTicketReservation(userEventReservations[0]);
                  setIsTicketModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                View Your Ticket
              </button>
            </div>
          )}

          {/* Main Reservation Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Reserve Your Seat
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Guaranteed single-seat reservation verified on BOT Chain
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                Live Availability
              </span>
            </div>

            {/* Capacity & Availability Progress */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Seat Availability</span>
                <span className="font-bold text-slate-900">
                  <span className="text-emerald-600 font-extrabold">{availableSeats}</span> / {currentEvent.totalSeats} seats remaining
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round(((currentEvent.totalSeats - availableSeats) / currentEvent.totalSeats) * 100))}%`
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>{reservedSeats.length} seats reserved</span>
                <span>{Math.round((availableSeats / currentEvent.totalSeats) * 100)}% available</span>
              </div>
            </div>

            {/* Seat Allocation Section (No icons on selection box) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Assigned Seat
              </label>

              <div className="p-4 bg-white border-2 border-blue-600/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500 font-medium">
                    {activeSeatId ? "Assigned Seat Number" : "No seat selected"}
                  </div>
                  <div className="text-2xl font-black font-mono text-blue-600 mt-0.5">
                    {activeSeatId ? `Seat ${activeSeatId}` : "None"}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Allocated automatically or customize your seat code below
                  </p>
                </div>

                {/* Custom Seat Input & Auto Assign */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customSeatInput}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().trim();
                      setCustomSeatInput(val);
                      if (val) {
                        setSelectedSeat(val);
                      } else {
                        setSelectedSeat(nextAvailableSeat);
                      }
                    }}
                    placeholder={nextAvailableSeat}
                    maxLength={6}
                    className="w-24 px-3 py-2 text-xs font-mono font-bold text-center border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSeat(nextAvailableSeat);
                      setCustomSeatInput("");
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                  >
                    Auto Assign
                  </button>
                </div>
              </div>
              
              {/* If the chosen seat is already taken */}
              {isSeatTaken && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
                  Seat {activeSeatId} has already been reserved. Please pick another seat or click Auto Assign.
                </div>
              )}
            </div>

            {/* Order Summary Breakdown */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>1x General Attendee Pass</span>
                <span className="font-semibold text-slate-900">Seat {activeSeatId}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Reservation</span>
                <span className="font-mono font-bold text-slate-900">Free</span>
              </div>

<div className="flex items-center justify-between pt-2 border-t border-slate-100 font-bold text-sm text-slate-900">
  <span>Total Due</span>
  <span className="font-mono text-blue-600">Network gas only</span>
</div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-2">
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all active:scale-98"
                >
                  Connect Wallet to Reserve
                </button>
              ) : (
                <button
                  onClick={handleOpenReserveModal}
                  disabled={availableSeats <= 0 || isSeatTaken || txState.step === "broadcasting" || txState.step === "confirming"}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <span>Reserve Seat</span>
                </button>
              )}
            </div>

            {/* Security Guarantee Note */}
            <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Permanent on-chain ticket verification with QR code</span>
            </div>
          </div>

        </div>

      </div>

      {/* Reservation Flow Modal */}
      {currentEvent && activeSeatId && (
        <ReservationModal
          isOpen={isReservationModalOpen}
          onClose={() => setIsReservationModalOpen(false)}
          event={currentEvent}
          seatId={activeSeatId}
          txState={txState}
          onConfirmReservation={handleConfirmReservation}
          onViewTicket={handleViewTicketFromModal}
          onReset={resetTxState}
        />
      )}

      {/* Digital Ticket Modal with QR Code */}
      {activeTicketReservation && (
        <TicketModal
          isOpen={isTicketModalOpen}
          onClose={() => {
            setIsTicketModalOpen(false);
            setActiveTicketReservation(null);
          }}
          reservation={activeTicketReservation}
          event={currentEvent}
        />
      )}

    </div>
  );
}
