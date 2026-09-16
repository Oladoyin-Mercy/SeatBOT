"use client";

import React, { useState, useMemo } from "react";
import { SeatInfo, SeatStatus } from "@/types";
import { Check, X, Lock, Info, Sparkles } from "lucide-react";

interface SeatMapProps {
  totalSeats: number;
  reservedSeats: string[];
  userReservedSeats?: string[];
  selectedSeat: string | null;
  onSelectSeat: (seatId: string) => void;
  rows?: number;
  colsPerRow?: number;
  onReserveClick?: () => void;
  isReserving?: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  totalSeats,
  reservedSeats,
  userReservedSeats = [],
  selectedSeat,
  onSelectSeat,
  rows = 5,
  colsPerRow = 10,
  onReserveClick,
  isReserving = false,
}) => {
  // Generate seats grid
  const rowLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];

  const seatGrid: SeatInfo[][] = useMemo(() => {
    const grid: SeatInfo[][] = [];
    let count = 0;

    for (let r = 0; r < rows && count < totalSeats; r++) {
      const rowLetter = rowLetters[r] || `R${r + 1}`;
      const rowSeats: SeatInfo[] = [];

      for (let c = 1; c <= colsPerRow && count < totalSeats; c++) {
        const seatId = `${rowLetter}${String(c).padStart(2, "0")}`;
        let status: SeatStatus = "available";

        if (userReservedSeats.includes(seatId)) {
          status = "user-reserved";
        } else if (reservedSeats.includes(seatId)) {
          status = "reserved";
        } else if (selectedSeat === seatId) {
          status = "selected";
        }

        rowSeats.push({
          id: seatId,
          row: rowLetter,
          number: c,
          status,
        });

        count++;
      }
      grid.push(rowSeats);
    }

    return grid;
  }, [totalSeats, reservedSeats, userReservedSeats, selectedSeat, rows, colsPerRow]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Auditorium Seat Map</h3>
          <p className="text-xs text-slate-500 mt-0.5">Select an available seat to lock your reservation on-chain</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md border border-slate-300 bg-white shadow-xs inline-block" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md bg-blue-600 shadow-xs inline-block" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md bg-slate-200 text-slate-400 flex items-center justify-center text-[10px] inline-flex">
              <X className="w-2.5 h-2.5" />
            </span>
            <span>Reserved</span>
          </div>
          {userReservedSeats.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] inline-flex">
                <Check className="w-2.5 h-2.5" />
              </span>
              <span>Your Spot</span>
            </div>
          )}
        </div>
      </div>

      {/* Stage Visual representation */}
      <div className="py-8 flex flex-col items-center">
        <div className="w-full max-w-lg mb-8 text-center">
          <div className="h-2 w-full bg-slate-200 rounded-full mx-auto" />
          <span className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase mt-2 inline-block">
            STAGE / SCREEN FRONT
          </span>
        </div>

        {/* Seat Layout Container with Horizontal Scroll for Mobile */}
        <div className="w-full overflow-x-auto pb-4 pt-2 flex justify-center">
          <div className="inline-flex flex-col gap-3 min-w-max px-2">
            {seatGrid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-2 sm:gap-3">
                
                {/* Left Row Indicator */}
                <span className="w-5 text-xs font-bold text-slate-400 font-mono text-center">
                  {rowLetters[rowIndex]}
                </span>

                {/* Seats in Row */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {row.map((seat, seatIdx) => {
                    const isSelected = seat.status === "selected";
                    const isReserved = seat.status === "reserved";
                    const isUserReserved = seat.status === "user-reserved";

                    // Split aisle after half the columns for realism
                    const hasAisleGap = colsPerRow > 6 && seatIdx === Math.floor(colsPerRow / 2) - 1;

                    return (
                      <React.Fragment key={seat.id}>
                        <button
                          type="button"
                          onClick={() => {
                            if (!isReserved && !isUserReserved) {
                              onSelectSeat(seat.id);
                            }
                          }}
                          disabled={isReserved || isUserReserved}
                          title={
                            isUserReserved
                              ? `Seat ${seat.id} (Your Reservation)`
                              : isReserved
                              ? `Seat ${seat.id} (Reserved)`
                              : `Seat ${seat.id} (Available)`
                          }
                          className={`
                            relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs font-mono font-medium transition-all duration-150 select-none
                            ${
                              isSelected
                                ? "bg-blue-600 text-white font-bold shadow-md scale-105 ring-2 ring-blue-600/30"
                                : isUserReserved
                                ? "bg-emerald-600 text-white font-bold cursor-default"
                                : isReserved
                                ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-white border border-slate-300 text-slate-700 hover:border-blue-600 hover:text-blue-600 hover:shadow-xs active:scale-95"
                            }
                          `}
                        >
                          {isSelected ? (
                            seat.id
                          ) : isUserReserved ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : isReserved ? (
                            <X className="w-3 h-3 text-slate-400" />
                          ) : (
                            <span className="text-[11px]">{seat.number}</span>
                          )}
                        </button>

                        {/* Aisle Spacer */}
                        {hasAisleGap && <div className="w-4 sm:w-6" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Right Row Indicator */}
                <span className="w-5 text-xs font-bold text-slate-400 font-mono text-center">
                  {rowLetters[rowIndex]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Seat Action Bar */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
            {selectedSeat ? (
              <span className="font-mono font-bold text-sm text-blue-600">{selectedSeat}</span>
            ) : (
              <Sparkles className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">
              {selectedSeat ? "Selected Seat" : "No Seat Selected"}
            </div>
            <div className="text-sm font-bold text-slate-900">
              {selectedSeat ? `Seat ${selectedSeat}` : "Click any available seat above"}
            </div>
          </div>
        </div>

        {/* Reserve CTA */}
        {selectedSeat && onReserveClick && (
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onReserveClick}
              disabled={isReserving}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Reserve Seat {selectedSeat}</span>
            </button>
          </div>
        )}
      </div>

      {/* Gas fee notice */}
      <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-500 px-1">
        <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          This reservation is recorded on <strong>BOT Chain</strong> smart contract for <strong>0.01 BOT</strong> to permanently guarantee your spot.
        </span>
      </div>
    </div>
  );
};
