"use client";

import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Download, 
  Printer, 
  Check, 
  Copy,
  Sparkles
} from "lucide-react";
import { Reservation, BOTEvent } from "@/types";
import { formatEventDate, formatAddress, getExplorerTxUrl } from "@/lib/config/botchain";
import { formatShortDate, generateReservationCode } from "@/lib/utils";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  event?: BOTEvent;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  reservation,
  event,
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [copiedTx, setCopiedTx] = React.useState(false);

  if (!isOpen) return null;

  const eventName = reservation.eventName || event?.name || "Event Reservation";
  const eventVenue = reservation.venue || event?.venue || "Main Auditorium";
  const eventDate = reservation.dateTimestamp || event?.dateTimestamp || reservation.reservedAt;
  const reservationCode = generateReservationCode(reservation.reservationId);
  const verifyUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/verify?id=${reservation.reservationId}`
    : `https://botseat.app/verify?id=${reservation.reservationId}`;

  const handlePrint = () => {
    window.print();
  };

  const copyTx = () => {
    if (reservation.txHash) {
      navigator.clipboard.writeText(reservation.txHash);
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-transparent flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between pb-3 px-1 text-white">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>Digital Ticket Verified on BOT Chain</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Close ticket"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Ticket Card */}
        <div 
          ref={ticketRef}
          className="w-full bg-white rounded-2xl shadow-ticket border border-slate-200 overflow-hidden text-slate-900 relative print:shadow-none print:border"
        >
          {/* Ticket Header Bar */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                B
              </div>
              <span className="font-bold text-sm tracking-tight">BOT<span className="text-blue-400">Seat</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Confirmed</span>
            </div>
          </div>

          {/* Event Details Section */}
          <div className="p-6 space-y-4">
            <div>
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                Official Event Admission
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight mt-0.5">
                {eventName}
              </h2>
            </div>

            {/* Seat & Reservation ID Spotlight */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  Reserved Seat
                </span>
                <span className="text-2xl font-black font-mono text-blue-600">
                  {reservation.seatId}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  Reservation Code
                </span>
                <span className="text-base font-bold font-mono text-slate-800">
                  {reservationCode}
                </span>
              </div>
            </div>

            {/* Date, Time & Venue */}
            <div className="space-y-2 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-medium text-slate-800">{formatShortDate(eventDate)}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="line-clamp-1">{eventVenue}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Reserved: {new Date(reservation.reservedAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* Perforated Divider with Notches */}
          <div className="relative w-full h-6 flex items-center justify-center my-1">
            <div className="ticket-notch-left" />
            <div className="w-full ticket-divider h-px" />
            <div className="ticket-notch-right" />
          </div>

          {/* Ticket QR Stub Section */}
          <div className="p-6 pt-3 bg-slate-50/50 flex flex-col items-center text-center space-y-4">
            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
              <QRCodeSVG
                value={verifyUrl}
                size={140}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Present this QR code at the event entrance for instant on-chain verification.
            </p>

            {/* Blockchain Metadata Details */}
            <div className="w-full pt-2 border-t border-slate-200/70 space-y-1.5 text-left text-[11px] text-slate-500">
              <div className="flex items-center justify-between">
                <span>Attendee Wallet:</span>
                <span className="font-mono font-medium text-slate-700">
                  {formatAddress(reservation.attendee)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Network:</span>
                <span className="font-medium text-slate-700">BOT Chain (677)</span>
              </div>
              {reservation.txHash && (
                <div className="flex items-center justify-between">
                  <span>Transaction:</span>
                  <a
                    href={getExplorerTxUrl(reservation.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-medium"
                  >
                    <span>{formatAddress(reservation.txHash)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Below Ticket */}
        <div className="w-full mt-4 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl shadow-sm border border-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print / Save Ticket</span>
          </button>
          
          <button
            onClick={onClose}
            className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
