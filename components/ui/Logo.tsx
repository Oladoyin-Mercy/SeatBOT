"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = "md", 
  showText = true,
  className = "" 
}) => {
  const sizeMap = {
    sm: { box: "w-7 h-7", img: 28, text: "text-base" },
    md: { box: "w-8 h-8", img: 32, text: "text-lg" },
    lg: { box: "w-10 h-10", img: 40, text: "text-xl" },
    xl: { box: "w-14 h-14", img: 56, text: "text-2xl" },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative ${current.box} rounded-xl overflow-hidden shadow-sm flex-shrink-0 transition-transform group-hover:scale-105 duration-200`}>
        <img
          src="/logo.svg"
          alt="SeatBOT Logo"
          width={current.img}
          height={current.img}
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <span className={`${current.text} font-bold tracking-tight text-slate-900 leading-none`}>
          Seat<span className="text-blue-600 font-extrabold">BOT</span>
        </span>
      )}
    </div>
  );
};
