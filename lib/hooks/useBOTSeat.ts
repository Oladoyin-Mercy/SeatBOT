"use client";

import { useState, useEffect, useCallback } from "react";
import { blockchainService, INITIAL_FEATURED_EVENTS } from "@/lib/services/blockchain";
import { useWallet } from "./useWallet";
import { BOTEvent, Reservation } from "@/types";
import { ethers } from "ethers";

export type ReservationStep = 
  | "idle"
  | "confirm_prompt"
  | "waiting_wallet"
  | "broadcasting"
  | "confirming"
  | "success"
  | "rejected"
  | "failed";

export interface ReservationTransactionState {
  step: ReservationStep;
  txHash: string | null;
  reservationId: number | null;
  seatId: string | null;
  errorMessage: string | null;
  blockNumber: number | null;
}

export function useBOTSeat() {
  const { 
    address, 
    isConnected, 
    getSigner, 
    isDemoWallet, 
    isCorrectNetwork, 
    switchNetwork, 
    chainId, 
    networkName 
  } = useWallet();
  const [events, setEvents] = useState<BOTEvent[]>(INITIAL_FEATURED_EVENTS);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState<boolean>(false);

  const [txState, setTxState] = useState<ReservationTransactionState>({
    step: "idle",
    txHash: null,
    reservationId: null,
    seatId: null,
    errorMessage: null,
    blockNumber: null,
  });

  // Load events
  const loadEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const fetched = await blockchainService.fetchEvents();
      // Combine with local organizer-created events if any
      const localEventsStr = typeof window !== "undefined" ? localStorage.getItem("botseat_local_events") : null;
      const localEvents: BOTEvent[] = localEventsStr ? JSON.parse(localEventsStr) : [];
      
      const all = [...localEvents, ...fetched.filter(f => !localEvents.some(l => l.id === f.id))];
      setEvents(all);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  // Load user reservations
  const loadUserReservations = useCallback(async () => {
    if (!address) {
      setUserReservations([]);
      return;
    }
    setIsLoadingReservations(true);
    try {
      const onChainRes = await blockchainService.fetchUserReservations(address);
      
      // Also get any saved in local storage for this address
      const localResStr = localStorage.getItem(`botseat_user_res_${address.toLowerCase()}`);
      const localRes: Reservation[] = localResStr ? JSON.parse(localResStr) : [];

      const merged = [...localRes, ...onChainRes.filter(o => !localRes.some(l => l.reservationId === o.reservationId))];
      setUserReservations(merged);
    } catch (err) {
      console.error("Failed to load user reservations:", err);
    } finally {
      setIsLoadingReservations(false);
    }
  }, [address]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    loadUserReservations();
  }, [loadUserReservations]);

  // Execute reservation on BOT Chain
  const reserveSeat = async (event: BOTEvent, seatId: string): Promise<boolean> => {
    if (!isConnected || !address) {
      setTxState({
        step: "failed",
        txHash: null,
        reservationId: null,
        seatId,
        errorMessage: "Please connect your wallet first.",
        blockNumber: null,
      });
      return false;
    }

    if (!isCorrectNetwork && !isDemoWallet) {
      // Attempt auto network switch to BOT Chain Mainnet
      const switched = await switchNetwork("mainnet");
      if (!switched) {
        const currentLabel = chainId === 1 ? "Ethereum Mainnet" : networkName || (chainId ? `Chain ID ${chainId}` : "another network");
        setTxState({
          step: "failed",
          txHash: null,
          reservationId: null,
          seatId,
          errorMessage: `SeatBOT smart contracts are deployed on BOT Chain Mainnet (Chain ID 677). Your wallet is connected to ${currentLabel}. Please switch to BOT Chain Mainnet to reserve seats.`,
          blockNumber: null,
        });
        return false;
      }
    }

    // Step 1: Prompt in wallet
    setTxState({
      step: "waiting_wallet",
      txHash: null,
      reservationId: null,
      seatId,
      errorMessage: null,
      blockNumber: null,
    });

    try {
      const signer = await getSigner();
      
      if (!signer) {
        throw new Error("Could not retrieve wallet signer. Please ensure your wallet is connected.");
      }

      setTxState(prev => ({ ...prev, step: "broadcasting" }));

      // Call blockchainService.reserveSeat (0 BOT value, gas only)
      const result = await blockchainService.reserveSeat(
        signer,
        event.id,
        seatId
      );

      const txHash = result.txHash;
      const resId = result.reservationId;

      const newReservation: Reservation = {
        reservationId: resId,
        eventId: event.id,
        seatId,
        attendee: address,
        reservedAt: Math.floor(Date.now() / 1000),
        isCancelled: false,
        txHash,
        eventName: event.name,
        venue: event.venue,
        dateTimestamp: event.dateTimestamp,
      };

      // Persist in local storage for instant sync
      if (typeof window !== "undefined") {
        const existingKey = `botseat_user_res_${address.toLowerCase()}`;
        const existingStr = localStorage.getItem(existingKey);
        const list: Reservation[] = existingStr ? JSON.parse(existingStr) : [];
        localStorage.setItem(existingKey, JSON.stringify([newReservation, ...list]));

        // Save global verification record
        localStorage.setItem(`botseat_res_${resId}`, JSON.stringify({
          reservation: newReservation,
          event,
        }));

        // Record reserved seat for this event
        const seatKey = `botseat_event_${event.id}_reserved_seats`;
        const existingSeatsStr = localStorage.getItem(seatKey);
        const seatsList: string[] = existingSeatsStr ? JSON.parse(existingSeatsStr) : [];
        if (!seatsList.includes(seatId)) {
          localStorage.setItem(seatKey, JSON.stringify([...seatsList, seatId]));
        }
      }

      // Update state
      setTxState({
        step: "success",
        txHash,
        reservationId: resId,
        seatId,
        errorMessage: null,
        blockNumber: null,
      });

      // Reload lists
      loadUserReservations();
      return true;

    } catch (err: any) {
      console.error("Reservation failed:", err);
      const errMsg = err?.message || "Reservation could not be completed on BOT Chain.";
      if (err?.code === 4001 || errMsg.includes("cancelled in your wallet") || errMsg.includes("rejected")) {
        setTxState({
          step: "rejected",
          txHash: null,
          reservationId: null,
          seatId,
          errorMessage: "Transaction was cancelled in your wallet.",
          blockNumber: null,
        });
      } else {
        setTxState({
          step: "failed",
          txHash: null,
          reservationId: null,
          seatId,
          errorMessage: errMsg,
          blockNumber: null,
        });
      }
      return false;
    }
  };

  const resetTxState = () => {
    setTxState({
      step: "idle",
      txHash: null,
      reservationId: null,
      seatId: null,
      errorMessage: null,
      blockNumber: null,
    });
  };

  // Create event on-chain
  const createEvent = async (eventData: {
    name: string;
    description: string;
    venue: string;
    dateTimestamp: number;
    totalSeats?: number;
    image?: string;
    category?: string;
    timeString?: string;
    rows?: number;
    colsPerRow?: number;
  }): Promise<{ eventId: number; txHash: string } | null> => {
    if (!isConnected || !address) {
      throw new Error("Please connect your wallet first.");
    }

    // Network safety: block submissions to wrong chain
    if (!isCorrectNetwork && !isDemoWallet) {
      const switched = await switchNetwork("mainnet");
      if (!switched) {
        const currentLabel = chainId === 1 ? "Ethereum Mainnet" : networkName || (chainId ? `Chain ID ${chainId}` : "another network");
        throw new Error(
          `BOTSeat events must be created on BOT Chain Mainnet (Chain ID 677). Your wallet is connected to ${currentLabel}. Please switch networks and try again.`
        );
      }
    }

    const signer = await getSigner();
    if (!signer) throw new Error("Wallet signer not available. Please reconnect your wallet.");

    const totalSeats = eventData.totalSeats && eventData.totalSeats > 0 ? eventData.totalSeats : 100;

    const metadataURI = JSON.stringify({
      image: eventData.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      category: eventData.category || "General Event",
      timeString: eventData.timeString || "TBA",
      rows: eventData.rows || 5,
      colsPerRow: eventData.colsPerRow || Math.ceil(totalSeats / 5),
    });

    const { eventId, txHash } = await blockchainService.createEvent(signer, {
      name: eventData.name,
      description: eventData.description,
      venue: eventData.venue,
      dateTimestamp: eventData.dateTimestamp,
      totalSeats,
      metadataURI,
    });

    await loadEvents();
    return { eventId, txHash };
  };

  return {
    events,
    isLoadingEvents,
    loadEvents,
    userReservations,
    isLoadingReservations,
    loadUserReservations,
    reserveSeat,
    createEvent,
    txState,
    resetTxState,
  };
}
