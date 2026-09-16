export interface BOTEvent {
  id: number;
  name: string;
  description: string;
  venue: string;
  dateTimestamp: number; // Unix timestamp in seconds
  totalSeats: number;
  reservedCount: number;
  organizer: string;
  metadataURI: string;
  isActive: boolean;
  // Parsed metadata fields for presentation
  image?: string;
  category?: string;
  timeString?: string;
  price?: string; // Formatted display price
  priceInBot?: string; // Raw BOT amount e.g. "0.05" or "0"
  rows?: number;
  colsPerRow?: number;
}

export interface Reservation {
  reservationId: number;
  eventId: number;
  seatId: string; // e.g. "A24"
  attendee: string;
  reservedAt: number;
  isCancelled: boolean;
  txHash?: string;
  eventName?: string;
  venue?: string;
  dateTimestamp?: number;
}

export type SeatStatus = "available" | "selected" | "reserved" | "user-reserved";

export interface SeatInfo {
  id: string; // e.g. "A01"
  row: string; // e.g. "A"
  number: number; // e.g. 1
  status: SeatStatus;
  reservation?: Reservation;
}

export type NetworkType = "mainnet" | "testnet";

export interface NetworkConfig {
  chainId: number;
  hexChainId: string;
  name: string;
  rpcUrl: string;
  currencySymbol: string;
  explorerUrl: string;
  contractAddress: string;
}

export interface VerificationResult {
  isValid: boolean;
  checkedAt: number;
  reservation?: Reservation;
  event?: BOTEvent;
  errorMessage?: string;
}
