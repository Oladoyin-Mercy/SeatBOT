"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Users, 
  ShieldCheck, 
  ExternalLink, 
  Eye, 
  UserCheck, 
  X,
  Coins,
  Search
} from "lucide-react";
import { useBOTSeat } from "@/lib/hooks/useBOTSeat";
import { useWallet } from "@/lib/hooks/useWallet";
import { formatAddress, getExplorerAddressUrl, getExplorerTxUrl } from "@/lib/config/botchain";
import { formatShortDate, generateReservationCode } from "@/lib/utils";
import { blockchainService } from "@/lib/services/blockchain";
import { BOTEvent, Reservation } from "@/types";

export default function OrganizerDashboard() {
  const { events } = useBOTSeat();
  const { isConnected, address, connectWallet } = useWallet();

  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<BOTEvent | null>(null);
  const [attendeesList, setAttendeesList] = useState<Reservation[]>([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState("");

  const totalSeatsAll = events.reduce((acc, curr) => acc + curr.totalSeats, 0);
  const totalReservedAll = events.reduce((acc, curr) => acc + curr.reservedCount, 0);
  const occupancyRate = totalSeatsAll > 0 ? Math.round((totalReservedAll / totalSeatsAll) * 100) : 0;

  const handleOpenAttendees = async (event: BOTEvent) => {
    setSelectedEventForAttendees(event);
    setIsLoadingAttendees(true);
    try {
      const attendees = await blockchainService.fetchEventAttendees(event.id);
      setAttendeesList(attendees);
    } catch (err) {
      console.error("Failed to load attendees:", err);
      setAttendeesList([]);
    } finally {
      setIsLoadingAttendees(false);
    }
  };

  const filteredAttendees = attendeesList.filter((a) => {
    if (!attendeeSearchQuery) return true;
    const q = attendeeSearchQuery.toLowerCase();
    return (
      a.attendee.toLowerCase().includes(q) ||
      a.seatId.toLowerCase().includes(q) ||
      generateReservationCode(a.reservationId).toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Organizer Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor seat allocations, event capacity, and verify attendee wallet registrations recorded on BOT Chain.
          </p>
        </div>

        <Link
          href="/organizer/create"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Events
          </span>
          <div className="text-2xl font-black text-slate-900">
            {events.length}
          </div>
          <span className="text-[11px] text-slate-500 block">Active on BOT Chain</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Capacity
          </span>
          <div className="text-2xl font-black text-slate-900">
            {totalSeatsAll} Seats
          </div>
          <span className="text-[11px] text-slate-500 block">Across all venues</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Confirmed Registrations
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {totalReservedAll}
          </div>
          <span className="text-[11px] text-slate-500 block">Verified on-chain</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Avg Occupancy Rate
          </span>
          <div className="text-2xl font-black text-blue-600">
            {occupancyRate}%
          </div>
          <span className="text-[11px] text-slate-500 block">Seat booking demand</span>
        </div>

      </div>

      {/* Events Table / Card List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Managed Events
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &quot;View Attendees&quot; to inspect all registered wallet addresses and assigned seats
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {events.length} Events Listed
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {events.map((evt) => {
            const percent = Math.round((evt.reservedCount / evt.totalSeats) * 100);

            return (
              <div key={evt.id} className="p-6 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Left: Event Info */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={evt.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80"}
                      alt={evt.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {evt.name}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/50">
                        Active
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                        {evt.price || "Free"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatShortDate(evt.dateTimestamp)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {evt.venue}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        Organizer: {formatAddress(evt.organizer)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Capacity & Actions */}
                <div className="flex items-center gap-4 self-end md:self-center flex-wrap">
                  
                  {/* Progress bar */}
                  <div className="w-32 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{evt.reservedCount}/{evt.totalSeats}</span>
                      <span className="font-bold text-slate-800">{percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenAttendees(evt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>View Attendees ({evt.reservedCount})</span>
                    </button>

                    <Link
                      href={`/events/${evt.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Event Page</span>
                    </Link>

                    <Link
                      href="/verify"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <span>Verify Ticket</span>
                    </Link>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ATTENDEE ROSTER MODAL FOR ORGANIZER */}
      {selectedEventForAttendees && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl shadow-modal border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Registered Attendees Roster
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedEventForAttendees.name} • {selectedEventForAttendees.reservedCount} of {selectedEventForAttendees.totalSeats} seats filled
                </p>
              </div>
              <button
                onClick={() => setSelectedEventForAttendees(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Search Box */}
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={attendeeSearchQuery}
                  onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                  placeholder="Search by wallet address (0x...), seat code, or ticket #..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Attendees List Table */}
            <div className="overflow-y-auto p-6 flex-1 space-y-3">
              {isLoadingAttendees ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Querying registered wallets from BOT Chain...</p>
                </div>
              ) : filteredAttendees.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {filteredAttendees.map((att, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs flex items-center justify-center border border-blue-100">
                          {att.seatId}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {formatAddress(att.attendee)}
                            </span>
                            <a
                              href={getExplorerAddressUrl(att.attendee)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-blue-600 transition-colors"
                              title="View wallet on BOT Chain Explorer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            Ticket: {generateReservationCode(att.reservationId)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          Verified Seat
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {att.reservedAt ? new Date(att.reservedAt * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "On-chain"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No registered attendees yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    When attendees connect their wallets and reserve seats for this event, their wallet addresses and seat codes will appear here in real-time.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredAttendees.length} verified reservations</span>
              <button
                onClick={() => setSelectedEventForAttendees(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
