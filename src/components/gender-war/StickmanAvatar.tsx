"use client";

import React from "react";

export type GenderEmotion =
  | "VICTORIOUS"
  | "CONFIDENT"
  | "NEUTRAL_BALANCED"
  | "PERPLEXED"
  | "DEJECTED";

interface StickmanAvatarProps {
  gender: "MALE" | "FEMALE";
  emotion: GenderEmotion;
  className?: string;
  size?: number;
}

/**
 * StickmanAvatar — Blue male, Pink female. EXCLUSIVELY for Gender War.
 */
export function StickmanAvatar({ gender, emotion, className = "", size = 110 }: StickmanAvatarProps) {
  const fillColor = gender === "MALE" ? "#3b82f6" : "#ec4899";
  const strokeColor = gender === "MALE" ? "#2563eb" : "#db2777";

  if (gender === "FEMALE") {
    return (
      <div className={`relative inline-flex items-center justify-center transition-transform duration-300 ${className}`}
        style={{ width: size, height: size * 1.15 }}>
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm transition-all duration-300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="20" r="10" fill={fillColor} />
          <path d="M 42 16 C 36 12 30 15 28 20 C 26 25 32 26 38 23 Z" fill={fillColor} />

          {emotion === "VICTORIOUS" && (<g>
            <path d="M 43 33 L 57 33 L 66 74 L 34 74 Z" fill={fillColor} />
            <path d="M 40 37 Q 32 47 42 53 Q 50 56 60 52 Q 68 47 60 37" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="43" y1="74" x2="43" y2="110" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="57" y1="74" x2="57" y2="110" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          </g>)}
          {emotion === "CONFIDENT" && (<g>
            <path d="M 43 33 L 57 33 L 65 74 L 35 74 Z" fill={fillColor} />
            <path d="M 41 37 L 33 50 L 40 56" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" />
            <path d="M 59 37 L 68 46 L 76 43" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" />
            <line x1="43" y1="74" x2="41" y2="110" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="57" y1="74" x2="59" y2="110" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          </g>)}
          {emotion === "NEUTRAL_BALANCED" && (<g>
            <path d="M 43 33 L 57 33 L 65 74 L 35 74 Z" fill={fillColor} />
            <path d="M 59 36 L 70 28 L 62 18" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" />
            <path d="M 41 36 L 37 54 L 39 70" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" />
            <line x1="44" y1="74" x2="44" y2="110" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="56" y1="74" x2="56" y2="110" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          </g>)}
          {emotion === "PERPLEXED" && (<g>
            <path d="M 40 36 L 54 34 L 52 75 L 30 71 Z" fill={fillColor} transform="rotate(12 40 36)" />
            <path d="M 44 40 L 52 56 L 50 72" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" />
            <line x1="40" y1="75" x2="38" y2="108" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="54" y1="75" x2="56" y2="108" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          </g>)}
          {emotion === "DEJECTED" && (<g>
            <path d="M 42 34 L 56 34 L 64 74 L 36 74 Z" fill={fillColor} />
            <path d="M 40 38 L 30 30 L 42 20" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" />
            <path d="M 58 38 L 66 52 L 64 68" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" />
            <line x1="43" y1="74" x2="40" y2="108" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="57" y1="74" x2="58" y2="108" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          </g>)}
        </svg>
      </div>
    );
  }

  // Male
  return (
    <div className={`relative inline-flex items-center justify-center transition-transform duration-300 ${className}`}
      style={{ width: size, height: size * 1.15 }}>
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm transition-all duration-300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="16" r="11" fill={fillColor} />

        {emotion === "VICTORIOUS" && (<g>
          <line x1="50" y1="29" x2="50" y2="66" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" />
          <line x1="34" y1="38" x2="66" y2="38" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M 34 38 L 22 18 L 18 8" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 66 38 L 78 18 L 82 8" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 50 66 L 34 82 L 24 76" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 50 66 L 66 82 L 76 76" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </g>)}
        {emotion === "CONFIDENT" && (<g>
          <line x1="50" y1="29" x2="50" y2="66" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" />
          <line x1="34" y1="38" x2="66" y2="38" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M 34 38 L 22 48 L 16 40" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 66 38 L 76 46 L 82 56" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 50 66 L 36 82 L 26 98" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 50 66 L 62 78 L 72 72" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </g>)}
        {emotion === "NEUTRAL_BALANCED" && (<g>
          <line x1="50" y1="29" x2="50" y2="68" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" />
          <line x1="34" y1="38" x2="66" y2="38" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M 34 38 L 28 50 L 38 58" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 66 38 L 72 50 L 62 58" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="44" y1="68" x2="42" y2="108" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <line x1="56" y1="68" x2="58" y2="108" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
        </g>)}
        {emotion === "PERPLEXED" && (<g>
          <line x1="50" y1="29" x2="48" y2="66" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" />
          <line x1="33" y1="38" x2="65" y2="38" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M 33 38 L 30 50 L 34 62" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 65 38 L 68 28 L 60 16" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 48 66 L 40 86 L 36 108" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 48 66 L 58 84 L 56 108" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </g>)}
        {emotion === "DEJECTED" && (<g>
          <line x1="50" y1="29" x2="50" y2="68" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" />
          <line x1="34" y1="40" x2="66" y2="40" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M 34 40 L 30 28 L 40 14" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 66 40 L 70 28 L 60 14" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="46" y1="68" x2="43" y2="108" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
          <line x1="54" y1="68" x2="57" y2="108" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
        </g>)}
      </svg>
    </div>
  );
}
