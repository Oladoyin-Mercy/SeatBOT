"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Upload, 
  Image as ImageIcon, 
  ShieldCheck, 
  Loader2,
  Coins,
  Users,
  X,
  Sparkles
} from "lucide-react";
import { useBOTSeat } from "@/lib/hooks/useBOTSeat";
import { useWallet } from "@/lib/hooks/useWallet";

export default function CreateEventPage() {
  const router = useRouter();
  const { createEvent } = useBOTSeat();
  const { isConnected, connectWallet, address } = useWallet();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Developer Conference");
  const [venue, setVenue] = useState("");
  const [dateStr, setDateStr] = useState("2026-10-20");
  const [timeStr, setTimeStr] = useState("09:00 AM - 05:00 PM WAT");
  const [priceInBot, setPriceInBot] = useState("0.01");
  const [seatsInput, setSeatsInput] = useState("");
  const [image, setImage] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage("");
    setImageUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !venue || !dateStr) {
      alert("Please fill in the required event name, venue, and date.");
      return;
    }

    if (!isConnected) {
      await connectWallet();
      return;
    }

    setIsSubmitting(true);
    try {
      const dateTimestamp = Math.floor(new Date(dateStr).getTime() / 1000);
      const parsedSeats = parseInt(seatsInput, 10);
      const totalSeats = !isNaN(parsedSeats) && parsedSeats > 0 ? parsedSeats : 100;
      const finalImage = image || imageUrlInput || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";

      const newId = await createEvent({
        name,
        description: description || "No description provided.",
        venue,
        dateTimestamp,
        totalSeats,
        image: finalImage,
        category,
        timeString: timeStr,
        priceInBot: priceInBot.trim() || "0",
      });

      if (newId) {
        router.push(`/events/${newId}`);
      }
    } catch (err) {
      console.error("Event creation failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back link */}
      <div>
        <Link
          href="/organizer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organizer Hub</span>
        </Link>
      </div>

      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create an Event on BOT Chain
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Publish your event and configure custom seat capacity and reservation pricing.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Event Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Event Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Event Name */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Event Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. DevFest Ogbomoso 2026"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              >
                <option value="Developer Conference">Developer Conference</option>
                <option value="AI & Innovation">AI & Innovation</option>
                <option value="Workshop & Hackathon">Workshop & Hackathon</option>
                <option value="General Gathering">General Gathering</option>
              </select>
            </div>

            {/* Venue */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Venue Location *
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. LAUTECH Great Hall, Ogbomoso"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Date *
              </label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>

            {/* Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Time Window
              </label>
              <input
                type="text"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                placeholder="e.g. 09:00 AM - 05:00 PM WAT"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your event, agenda, speaker lineup, or instructions for attendees..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none"
              />
            </div>

          </div>
        </div>

        {/* Section 2: Pricing & Capacity (Seats) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-4 h-4 text-blue-600" />
            <span>Pricing & Seating Capacity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Reservation Price in BOT */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Reservation Price (in BOT) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  required
                  value={priceInBot}
                  onChange={(e) => setPriceInBot(e.target.value)}
                  placeholder="e.g. 0.05 (or 0 for Free)"
                  className="w-full pl-4 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-bold text-slate-500">
                  BOT
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Set custom fee in BOT. Enter <strong className="text-slate-700">0</strong> for free admission.
              </p>
            </div>

            {/* Total Available Seats (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Number of Seats Available <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={seatsInput}
                  onChange={(e) => setSeatsInput(e.target.value)}
                  placeholder="e.g. 100 (leave blank for open capacity)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Optional. Leave empty for default open seating capacity.
              </p>
            </div>

          </div>
        </div>

        {/* Section 3: Event Banner Upload from Gallery */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>Event Banner Image</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {showUrlInput ? "Upload from device" : "Or enter image URL"}
            </button>
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          {!showUrlInput ? (
            <div>
              {image ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Event banner preview"
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white text-slate-800 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-rose-700 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-600 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl p-8 text-center cursor-pointer transition-colors space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Upload Banner from Device / Gallery
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose an image from your device (PNG, JPG, WEBP up to 5MB)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg shadow-xs hover:bg-slate-50"
                  >
                    Browse Device
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => {
                  setImageUrlInput(e.target.value);
                  setImage(e.target.value);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
              {imageUrlInput && (
                <div className="relative rounded-xl overflow-hidden h-40 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrlInput}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">BOT Chain Smart Contract Publishing</span>
            </div>
            <p className="text-xs text-slate-300">
              Organizer wallet signs and permanently publishes event and reservation fee details on-chain.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Event...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Publish Event</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
