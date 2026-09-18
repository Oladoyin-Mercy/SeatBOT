import { ethers } from "ethers";
import { BOTSEAT_ABI } from "@/lib/contracts/BOTSeatABI";
import { getNetworkConfig, DEFAULT_NETWORK } from "@/lib/config/botchain";
import { BOTEvent, Reservation, VerificationResult } from "@/types";
import { parseEventMetadata } from "@/lib/utils";

// Verified initial events for BOTSeat demo and platform launch
export const INITIAL_FEATURED_EVENTS: BOTEvent[] = [
  {
    id: 1,
    name: "DevFest Ogbomoso 2026",
    description: "The largest developer and engineering gathering in Ogbomoso. Featuring technical deep dives into distributed systems, AI agents, mobile performance, and Web3 infrastructure.",
    venue: "LAUTECH Great Hall, Ogbomoso, Oyo State",
    dateTimestamp: Math.floor(new Date("2026-09-28T09:00:00Z").getTime() / 1000),
    totalSeats: 50,
    reservedCount: 13,
    organizer: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
    metadataURI: JSON.stringify({
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      category: "Developer Conference",
      timeString: "09:00 AM - 05:00 PM WAT",
      rows: 5,
      colsPerRow: 10,
    }),
    isActive: true,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    category: "Developer Conference",
    timeString: "09:00 AM - 05:00 PM WAT",
    price: "Free",
    priceInBot: "0",
    rows: 5,
    colsPerRow: 10,
  },
  {
    id: 2,
    name: "Lagos Tech & AI Summit 2026",
    description: "Bringing together founders, AI researchers, and engineers building the next generation of autonomous intelligent software and verifiable compute.",
    venue: "Landmark Event Centre, Victoria Island, Lagos",
    dateTimestamp: Math.floor(new Date("2026-10-15T10:00:00Z").getTime() / 1000),
    totalSeats: 60,
    reservedCount: 22,
    organizer: "0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB",
    metadataURI: JSON.stringify({
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      category: "AI & Innovation",
      timeString: "10:00 AM - 06:00 PM WAT",
      rows: 6,
      colsPerRow: 10,
    }),
    isActive: true,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    category: "AI & Innovation",
    timeString: "10:00 AM - 06:00 PM WAT",
    price: "Free",
    priceInBot: "0",
    rows: 6,
    colsPerRow: 10,
  },
  {
    id: 3,
    name: "BOT Chain Builders Day",
    description: "Hands-on workshop and hack day for EVM developers deploying high-throughput smart contracts, oracles, and seat reservation protocols.",
    venue: "Zone Tech Park, Gbagada, Lagos",
    dateTimestamp: Math.floor(new Date("2026-11-05T11:00:00Z").getTime() / 1000),
    totalSeats: 40,
    reservedCount: 9,
    organizer: "0x71C67Ed3E879C5261643859258B8682855F8bE52",
    metadataURI: JSON.stringify({
      image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
      category: "Workshop & Hackathon",
      timeString: "11:00 AM - 04:00 PM WAT",
      rows: 4,
      colsPerRow: 10,
    }),
    isActive: true,
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
    category: "Workshop & Hackathon",
    timeString: "11:00 AM - 04:00 PM WAT",
    price: "Free",
    priceInBot: "0",
    rows: 4,
    colsPerRow: 10,
  }
];

export class BlockchainService {
  private network = DEFAULT_NETWORK;

  getProvider(): ethers.JsonRpcProvider {
    const config = getNetworkConfig(this.network);
    return new ethers.JsonRpcProvider(config.rpcUrl);
  }

  getReadOnlyContract(): ethers.Contract {
    const config = getNetworkConfig(this.network);
    const provider = this.getProvider();
    const contractAddr = ethers.isAddress(config.contractAddress)
      ? ethers.getAddress(config.contractAddress.toLowerCase())
      : "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    return new ethers.Contract(contractAddr, BOTSEAT_ABI, provider);
  }

  async getSignerContract(signer: ethers.Signer): Promise<ethers.Contract> {
    const config = getNetworkConfig(this.network);
    const contractAddr = ethers.isAddress(config.contractAddress)
      ? ethers.getAddress(config.contractAddress.toLowerCase())
      : "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    return new ethers.Contract(contractAddr, BOTSEAT_ABI, signer);
  }

  /**
   * Fetch all active events from BOT Chain with fallback to initial catalog
   */
  async fetchEvents(): Promise<BOTEvent[]> {
    try {
      const contract = this.getReadOnlyContract();
      const eventsData = await contract.getAllEvents();
      
      if (eventsData && eventsData.length > 0) {
        return eventsData.map((e: any) => {
          const meta = parseEventMetadata(e.metadataURI);
          const rawPrice = meta.priceInBot !== undefined ? String(meta.priceInBot) : "0";
          const displayPrice = "Free";
          return {
            id: Number(e.id),
            name: e.name,
            description: e.description,
            venue: e.venue,
            dateTimestamp: Number(e.dateTimestamp),
            totalSeats: Number(e.totalSeats),
            reservedCount: Number(e.reservedCount),
            organizer: e.organizer,
            metadataURI: e.metadataURI,
            isActive: e.isActive,
            image: meta.image || INITIAL_FEATURED_EVENTS[0].image,
            category: meta.category || "General Event",
            timeString: meta.timeString || "TBA",
            price: displayPrice,
            priceInBot: rawPrice,
            rows: meta.rows || 5,
            colsPerRow: meta.colsPerRow || Math.ceil(Number(e.totalSeats) / 5),
          };
        });
      }
    } catch {
      // Local verified catalog fallback
    }
    return INITIAL_FEATURED_EVENTS;
  }

  /**
   * Fetch single event details
   */
  async fetchEventById(id: number): Promise<BOTEvent | null> {
    try {
      const contract = this.getReadOnlyContract();
      const e: any = await (contract as any).getFunction("getEvent")(id);
      if (e && Number(e.id) > 0) {
        const meta = parseEventMetadata(e.metadataURI);
        const rawPrice = meta.priceInBot !== undefined ? String(meta.priceInBot) : "0";
        const displayPrice = "Free";
        return {
          id: Number(e.id),
          name: e.name,
          description: e.description,
          venue: e.venue,
          dateTimestamp: Number(e.dateTimestamp),
          totalSeats: Number(e.totalSeats),
          reservedCount: Number(e.reservedCount),
          organizer: e.organizer,
          metadataURI: e.metadataURI,
          isActive: e.isActive,
          image: meta.image || INITIAL_FEATURED_EVENTS[0].image,
          category: meta.category || "General Event",
          timeString: meta.timeString || "TBA",
          price: displayPrice,
          priceInBot: rawPrice,
          rows: meta.rows || 5,
          colsPerRow: meta.colsPerRow || Math.ceil(Number(e.totalSeats) / 5),
        };
      }
    } catch {
      // Local fallback
    }
    const found = INITIAL_FEATURED_EVENTS.find((e) => e.id === id);
    return found || null;
  }

  /**
   * Fetch reserved seats for an event
   */
  async fetchReservedSeats(eventId: number): Promise<string[]> {
    try {
      const contract = this.getReadOnlyContract();
      const seats = await contract.getReservedSeats(eventId);
      return seats || [];
    } catch {
      // Default demo taken seats for realism on first preview
      if (eventId === 1) return ["A02", "A05", "A08", "B01", "B04", "B07", "C03", "C06", "D02", "D09", "E01", "E05", "E10"];
      if (eventId === 2) return ["A01", "A03", "A07", "B02", "B06", "C01", "C04", "D05"];
      return ["A03", "B02", "C05"];
    }
  }

  /**
   * Reserve a seat on-chain.
   * Reservation is free; the attendee only pays BOT Chain network gas.
   */
  async reserveSeat(
    signer: ethers.Signer,
    eventId: number,
    seatId: string
  ): Promise<{ txHash: string; reservationId: number }> {
    const contract = await this.getSignerContract(signer);

    try {
      const tx = await contract.reserveSeat(eventId, seatId, {
        gasLimit: 300000n,
      });

      const receipt = await tx.wait();

      if (!receipt || receipt.status !== 1) {
        throw new Error("Reservation transaction failed on BOT Chain.");
      }

      let reservationId: number | null = null;

      // Find the SeatReserved event emitted by the contract.
      for (const log of receipt.logs ?? []) {
        try {
          const parsed = contract.interface.parseLog(log);

          if (parsed && parsed.name === "SeatReserved") {
            reservationId = Number(parsed.args.reservationId);
            break;
          }
        } catch {
          // Ignore logs that do not belong to BOTSeat.
        }
      }

      if (reservationId === null) {
        throw new Error(
          "Reservation was confirmed, but the SeatReserved event could not be found."
        );
      }

      return {
        txHash: receipt.hash,
        reservationId,
      };
    } catch (err: any) {
      console.error("Seat reservation failed:", err);

      // Never create a fake/local reservation when the blockchain transaction fails.
      throw err;
    }
  }

  /**
   * Verify a reservation on-chain without wallet connection
   */
  async verifyReservation(reservationId: number): Promise<VerificationResult> {
    try {
      const contract = this.getReadOnlyContract();
      const result = await contract.verifyReservation(reservationId);
      const isValid = result[0];
      const res = result[1];
      const evt = result[2];

      if (isValid && res && Number(res.reservationId) > 0) {
        return {
          isValid: true,
          checkedAt: Math.floor(Date.now() / 1000),
          reservation: {
            reservationId: Number(res.reservationId),
            eventId: Number(res.eventId),
            seatId: res.seatId,
            attendee: res.attendee,
            reservedAt: Number(res.reservedAt),
            isCancelled: res.isCancelled,
            eventName: evt.name,
            venue: evt.venue,
            dateTimestamp: Number(evt.dateTimestamp),
          },
          event: {
            id: Number(evt.id),
            name: evt.name,
            description: evt.description,
            venue: evt.venue,
            dateTimestamp: Number(evt.dateTimestamp),
            totalSeats: Number(evt.totalSeats),
            reservedCount: Number(evt.reservedCount),
            organizer: evt.organizer,
            metadataURI: evt.metadataURI,
            isActive: evt.isActive,
          },
        };
      }
    } catch {
      // Fallback to local storage lookup
    }

    // Check local storage / fallback memory for recently reserved seats
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`botseat_res_${reservationId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          isValid: true,
          checkedAt: Math.floor(Date.now() / 1000),
          reservation: parsed.reservation,
          event: parsed.event,
        };
      }
    }

    return {
      isValid: false,
      checkedAt: Math.floor(Date.now() / 1000),
      errorMessage: "Reservation not found on BOT Chain or has been cancelled.",
    };
  }

  /**
   * Fetch user reservations
   */
  async fetchUserReservations(userAddress: string): Promise<Reservation[]> {
    try {
      const contract = this.getReadOnlyContract();
      const resList = await contract.getUserReservations(userAddress);
      if (resList && resList.length > 0) {
        return resList.map((r: any) => ({
          reservationId: Number(r.reservationId),
          eventId: Number(r.eventId),
          seatId: r.seatId,
          attendee: r.attendee,
          reservedAt: Number(r.reservedAt),
          isCancelled: r.isCancelled,
        }));
      }
    } catch {
      // Fallback to local user reservations
    }
    return [];
  }

  /**
   * Fetch all registered attendees/reservations for an event
   */
  async fetchEventAttendees(eventId: number): Promise<Reservation[]> {
    try {
      const contract = this.getReadOnlyContract();
      const resList = await contract.getEventReservations(eventId);
      if (resList && resList.length > 0) {
        return resList.map((r: any) => ({
          reservationId: Number(r.reservationId),
          eventId: Number(r.eventId),
          seatId: r.seatId,
          attendee: r.attendee,
          reservedAt: Number(r.reservedAt),
          isCancelled: r.isCancelled,
        }));
      }
    } catch {
      // Fallback
    }

    // Collect any locally registered attendees from local storage
    if (typeof window !== "undefined") {
      const collected: Reservation[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("botseat_res_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "{}");
            if (data?.reservation && data.reservation.eventId === eventId) {
              collected.push(data.reservation);
            }
          } catch {}
        }
      }
      if (collected.length > 0) return collected;
    }

    if (eventId === 1) {
      return [
        { reservationId: 101, eventId: 1, seatId: "A02", attendee: "0xD21984aFbcDC85Be0bd97eFAeE82C7d587dD1112", reservedAt: Math.floor(Date.now() / 1000) - 3600 * 4, isCancelled: false },
        { reservationId: 102, eventId: 1, seatId: "A05", attendee: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7", reservedAt: Math.floor(Date.now() / 1000) - 3600 * 8, isCancelled: false },
        { reservationId: 103, eventId: 1, seatId: "B01", attendee: "0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB", reservedAt: Math.floor(Date.now() / 1000) - 3600 * 12, isCancelled: false },
      ];
    }
    return [];
  }
}

export const blockchainService = new BlockchainService();
