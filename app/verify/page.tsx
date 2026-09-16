"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  ExternalLink 
} from "lucide-react";
import { blockchainService } from "@/lib/services/blockchain";
import { formatEventDate, formatAddress, getExplorerTxUrl, getExplorerAddressUrl } from "@/lib/config/botchain";
import { formatShortDate, generateReservationCode } from "@/lib/utils";
import { VerificationResult } from "@/types";

function VerifyContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");

  const [inputCode, setInputCode] = useState(queryId || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-verify if ID is in URL
  useEffect(() => {
    if (queryId) {
      handleVerify(queryId);
    }
  }, [queryId]);

  const handleVerify = async (valToVerify?: string) => {
    const target = valToVerify || inputCode;
    if (!target.trim()) return;

    setIsVerifying(true);
    setHasSearched(true);

    // Extract numerical ID from inputs like "#BOT-0248", "BOT-248", or "248"
    const cleaned = target.replace(/[^0-9]/g, "");
    const numericId = parseInt(cleaned, 10);

    if (isNaN(numericId) || numericId <= 0) {
      setResult({
        isValid: false,
        checkedAt: Math.floor(Date.now() / 1000),
        errorMessage: "Invalid reservation code format. Please provide a valid numerical or #BOT-XXXX ID.",
      });
      setIsVerifying(false);
      return;
    }

    try {
      const res = await blockchainService.verifyReservation(numericId);
      setResult(res);
    } catch (err) {
      console.error("Verification failed:", err);
      setResult({
        isValid: false,
        checkedAt: Math.floor(Date.now() / 1000),
        errorMessage: "Could not query BOT Chain smart contract.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-blue-100">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Verify Reservation on BOT Chain
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Public ticket verification tool. Check any reservation ID or scanned ticket code directly against the smart contract.
        </p>
      </div>

      {/* Verification Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Enter Reservation ID or Scan Code
        </label>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 1, 248, or #BOT-0248"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={isVerifying || !inputCode.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isVerifying ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Ticket</span>
              </>
            )}
          </button>
        </div>

        {/* Example test shortcuts */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
          <span>Try sample IDs:</span>
          <button
            type="button"
            onClick={() => {
              setInputCode("#BOT-0001");
              handleVerify("#BOT-0001");
            }}
            className="font-mono text-blue-600 hover:underline"
          >
            #BOT-0001
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              setInputCode("#BOT-0248");
              handleVerify("#BOT-0248");
            }}
            className="font-mono text-blue-600 hover:underline"
          >
            #BOT-0248
          </button>
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && !isVerifying && result && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          {result.isValid && result.reservation ? (
            /* VALID RESERVATION CARD */
            <div className="bg-white rounded-2xl border-2 border-emerald-500/80 shadow-modal overflow-hidden">
              
              {/* Status Banner */}
              <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="font-bold text-sm tracking-wide">✓ RESERVATION VERIFIED</span>
                </div>
                <span className="text-xs bg-emerald-700/80 px-2.5 py-1 rounded-md font-mono font-medium">
                  {generateReservationCode(result.reservation.reservationId)}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Event
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {result.reservation.eventName || result.event?.name || "Event Reservation"}
                  </h2>
                </div>

                {/* Seat & Wallet Highlight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                      Allocated Seat
                    </span>
                    <span className="text-2xl font-black font-mono text-blue-600">
                      {result.reservation.seatId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                      Status
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Confirmed on BOT Chain
                    </span>
                  </div>
                </div>

                {/* Event & Blockchain Details */}
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Attendee Wallet:</span>
                    <a
                      href={getExplorerAddressUrl(result.reservation.attendee)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                    >
                      <span>{formatAddress(result.reservation.attendee)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Venue:</span>
                    <span className="font-medium text-slate-800 line-clamp-1">
                      {result.reservation.venue || result.event?.venue || "Auditorium"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Blockchain Network:</span>
                    <span className="font-semibold text-slate-800">BOT Chain (Chain ID 677)</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500">Reserved Timestamp:</span>
                    <span className="font-mono text-slate-700">
                      {new Date(result.reservation.reservedAt * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* INVALID RESERVATION CARD */
            <div className="bg-white rounded-2xl border border-rose-200 shadow-modal overflow-hidden">
              <div className="bg-rose-600 text-white px-6 py-4 flex items-center gap-2.5">
                <XCircle className="w-5 h-5 text-white" />
                <span className="font-bold text-sm tracking-wide">RESERVATION NOT FOUND</span>
              </div>
              <div className="p-6 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-800">
                  No active or valid reservation exists on BOT Chain for this ID.
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {result.errorMessage || "The reservation might be cancelled, incorrect, or has not yet been submitted to the blockchain."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
