import React from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { BOTEvent } from "@/types";
import { formatEventDate } from "@/lib/utils";

interface EventCardProps {
  event: BOTEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const availableSeats = Math.max(0, event.totalSeats - event.reservedCount);
  const occupancyPercent = Math.round((event.reservedCount / event.totalSeats) * 100);

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all duration-200 flex flex-col">
      {/* Event Banner Image */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />
        
        {/* Category Pill */}
        {event.category && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-800 shadow-sm border border-slate-200/50">
            {event.category}
          </div>
        )}

        {/* Free / Price Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/90 text-white rounded-full text-xs font-medium backdrop-blur-sm">
          {event.price || "Free Admission"}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          
          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {event.name}
          </h3>

          {/* Date & Time */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{formatEventDate(event.dateTimestamp)}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>

          {/* Short description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
            {event.description}
          </p>
        </div>

        {/* Seat Occupancy & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 font-medium">Availability</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              {availableSeats} seats left
            </span>
          </div>

          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all group-hover:bg-blue-600"
          >
            <span>Reserve Seat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
