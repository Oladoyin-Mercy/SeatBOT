import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEventDate(timestamp: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatEventTime(timestamp: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatShortDate(timestamp: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function generateReservationCode(id: number): string {
  return `#BOT-${String(id).padStart(4, "0")}`;
}

export function parseEventMetadata(uri?: string): {
  image?: string;
  category?: string;
  timeString?: string;
  priceInBot?: string;
  rows?: number;
  colsPerRow?: number;
  bannerGradient?: string;
} {
  if (!uri) return {};
  try {
    if (uri.startsWith("{") && uri.endsWith("}")) {
      return JSON.parse(uri);
    }
    return { image: uri };
  } catch {
    return { image: uri };
  }
}
