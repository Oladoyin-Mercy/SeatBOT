"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  Ticket, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { BOTEvent } from "@/types";
import { ReservationTransactionState } from "@/lib/hooks/useBOTSeat";
import { formatAddress, getExplorerTxUrl } from "@/lib/config/botchain";
import { generateReservationCode } from "@/lib/utils";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: BOTEvent;
  seatId: string;
  txState: ReservationTransactionState;
  onConfirmReservation: () => void;
  onViewTicket: (resId: number) => void;
  onReset: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  event,
  seatId,
  txState,
  onConfirmReservation,
  onViewTicket,
  onReset,
}) => {
  useEffect(() => {
    if (txState.step === "success") {
      // Fire subtle celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#2563eb", "#059669", "#0f172a", "#38bdf8"],
      });
    }
  }, [txState.step]);

  if (!isOpen) return null;

  const handleClose = () => {
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-modal border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              {txState.step === "success" 
                ? "Reservation Confirmed" 
                : txState.step === "failed" || txState.step === "rejected"
                ? "Reservation Status"
                : "Confirm Seat Reservation"}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body based on Transaction Step */}
        <div className="p-6">
          
          {/* STEP 1: Confirmation Prompt */}
          {(txState.step === "idle" || txState.step === "confirm_prompt") && (
            <div className="space-y-5">
              <div className="text-center py-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Target Reservation
                </span>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className="text-3xl font-black font-mono text-blue-600">
                    Seat {seatId}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {event.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {event.venue}
                </p>
              </div>

              {/* Informative Gas & Chain Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 font-medium">
                  <span className="text-slate-600">Reservation:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    Free
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Reservation is free. You only pay standard <strong>BOT Chain</strong> network gas.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleClose}
                  className="w-1/3 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmReservation}
                  className="w-2/3 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Continue to Wallet</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Waiting for Wallet Signature */}
          {txState.step === "waiting_wallet" && (
            <div className="py-8 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900">
                  Waiting for Wallet Confirmation
                </h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Please open your wallet and approve the reservation transaction for Seat <strong>{seatId}</strong>.
                </p>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                Network: BOT Chain • Submitting signature
              </div>
            </div>
          )}

          {/* STEP 3: Broadcasting / Confirming on BOT Chain */}
          {(txState.step === "broadcasting" || txState.step === "confirming") && (
            <div className="py-8 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900">
                  Recording on BOT Chain
                </h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Writing reservation data to smart contract and confirming block verification...
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Success State */}
          {txState.step === "success" && (
            <div className="space-y-5">
              <div className="py-2 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-extrabold text-lg text-slate-900">
                  Seat {seatId} is Reserved!
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your reservation is verified and locked on BOT Chain.
                </p>
              </div>

              {/* Reservation Details Snapshot */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Reservation Code:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {txState.reservationId ? generateReservationCode(txState.reservationId) : `#BOT-${seatId}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Event:</span>
                  <span className="font-semibold text-slate-900 text-right line-clamp-1 max-w-[200px]">
                    {event.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Assigned Seat:</span>
                  <span className="font-mono font-bold text-blue-600">
                    {seatId}
                  </span>
                </div>
                {txState.txHash && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Transaction:</span>
                    <a
                      href={getExplorerTxUrl(txState.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>{formatAddress(txState.txHash)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => {
                    if (txState.reservationId) {
                      onViewTicket(txState.reservationId);
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>View Digital Ticket & QR Code</span>
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl border border-slate-200 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Rejected in Wallet */}
          {txState.step === "rejected" && (
            <div className="py-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900">
                  Transaction Cancelled
                </h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  The reservation transaction was rejected in your wallet. Seat <strong>{seatId}</strong> has not been reserved.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full pt-2">
                <button
                  onClick={handleClose}
                  className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmReservation}
                  className="w-1/2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Failed State */}
          {txState.step === "failed" && (
            <div className="py-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900">
                  Reservation Failed
                </h4>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                  {txState.errorMessage || "Reservation could not be completed on BOT Chain."}
                </p>
              </div>
              <div className="flex items-center gap-3 w-full pt-2">
                <button
                  onClick={handleClose}
                  className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={onConfirmReservation}
                  className="w-1/2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
