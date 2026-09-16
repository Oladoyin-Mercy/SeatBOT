"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  QrCode, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Ticket, 
  Lock, 
  Sparkles,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useBOTSeat } from "@/lib/hooks/useBOTSeat";
import { EventCard } from "@/components/events/EventCard";
import { formatShortDate } from "@/lib/utils";

export default function HomePage() {
  const { events, isLoadingEvents } = useBOTSeat();

  return (
    <div className="w-full space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Reserve your seat. <br />
              <span className="text-blue-600">Own your spot.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl font-normal">
              A simple, verifiable way to reserve event seats using BOT Chain. Guaranteed single-seat ownership with instant digital tickets.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all active:scale-98"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href="/organizer/create"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-200 shadow-xs transition-colors"
              >
                <span>Create an Event</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 border-t border-slate-200/60 grid grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Zero Double-Booking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Verifiable QR Codes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Custom BOT Pricing</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Realistic Reservation Showcase */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-modal p-5 space-y-4">
              
              {/* Event Mini Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    DF
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">DevFest Ogbomoso 2026</h3>
                    <p className="text-[11px] text-slate-500">LAUTECH Great Hall • Sept 28</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/50">
                  Open Seating
                </span>
              </div>

              {/* Realistic Reservation Pass Card Preview */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Assigned Spot</span>
                  <span className="font-mono text-emerald-600 font-bold">Guaranteed Pass</span>
                </div>
                
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Target Seat</span>
                    <span className="text-xl font-bold font-mono text-blue-600">Seat A24</span>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded-md">
                    0.01 BOT
                  </span>
                </div>
              </div>

              {/* Realistic Digital Ticket Sample Preview */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Digital Ticket</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Verified on BOT Chain</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Seat</span>
                    <span className="text-xl font-mono font-bold text-white">A24</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Fee</span>
                    <span className="text-sm font-mono font-bold text-blue-400">0.01 BOT</span>
                  </div>
                </div>
              </div>

              {/* Direct Link */}
              <Link
                href="/events/1"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Try Reserving a Seat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 2. UPCOMING EVENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Upcoming Events
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select an event to view real-time seat availability and secure your spot on-chain.
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View All Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.slice(0, 3).map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-14">
          <div className="max-w-xl mb-12">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              Simple Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              How BOTSeat Works
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              From event discovery to door admission in 4 transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="space-y-3">
              <span className="font-mono text-2xl font-black text-blue-400">01</span>
              <h3 className="text-base font-bold text-white">Find an event</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browse conferences, hackathons, and gatherings listed on the platform.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <span className="font-mono text-2xl font-black text-blue-400">02</span>
              <h3 className="text-base font-bold text-white">Pick your seat</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open the interactive auditorium map and choose your preferred available seat.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <span className="font-mono text-2xl font-black text-blue-400">03</span>
              <h3 className="text-base font-bold text-white">Reserve on-chain</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Confirm from your wallet. Pay 0.01 BOT + gas to record your reservation.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3">
              <span className="font-mono text-2xl font-black text-blue-400">04</span>
              <h3 className="text-base font-bold text-white">Show your ticket</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive an authentic digital ticket with QR code ready for instant entrance verification.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. ORGANIZER CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Hosting an event or conference?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Configure your seat layout, publish to BOT Chain, and eliminate double-booking.
            </p>
          </div>
          <Link
            href="/organizer/create"
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex-shrink-0"
          >
            Create an Event Now
          </Link>
        </div>
      </section>

    </div>
  );
}
