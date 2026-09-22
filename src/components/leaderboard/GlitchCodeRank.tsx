"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

const TARGET_TEXT = "CodeRank";
const HACKER_SYMBOLS = [
  "{", "}", ":", "(", ")", "<", ">",
  "/", "0", "1", "[", "]", "*", "+",
  "=", "#", "!", "?", "_", "$", ";", "%"
];

// Fixed character widths relative to font size (em) to ensure structure remains 100% intact
const CHAR_WIDTHS = [
  "0.72em", // C
  "0.62em", // o
  "0.64em", // d
  "0.58em", // e
  "0.70em", // R
  "0.60em", // a
  "0.64em", // n
  "0.60em", // k
];

interface Particle {
  id: number;
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
}

export function GlitchCodeRank() {
  const [characters, setCharacters] = useState<string[]>(TARGET_TEXT.split(""));
  const [isGlitching, setIsGlitching] = useState(false);
  const [sliceOffset, setSliceOffset] = useState({ x: 0, y: 0 });
  const [chromaticOffset, setChromaticOffset] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const glitchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resolveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const particleIdRef = useRef(0);

  // Spawn hacker bit particle
  const spawnParticle = useCallback((xPercent?: number) => {
    const randomSymbol = HACKER_SYMBOLS[Math.floor(Math.random() * HACKER_SYMBOLS.length)];
    const x = xPercent ?? Math.random() * 90 + 5;
    const newParticle: Particle = {
      id: ++particleIdRef.current,
      char: randomSymbol,
      x,
      y: Math.random() * 20 + 40,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(Math.random() * 2 + 1.5),
      opacity: 1,
      size: Math.random() * 6 + 10,
    };

    setParticles((prev) => [...prev.slice(-18), newParticle]);
  }, []);

  // Update particles animation loop
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            opacity: p.opacity - 0.05,
          }))
          .filter((p) => p.opacity > 0)
      );
    }, 30);

    return () => clearInterval(interval);
  }, [particles.length]);

  // Start continuous glitching
  const startGlitching = useCallback(() => {
    if (resolveTimerRef.current) {
      clearInterval(resolveTimerRef.current);
      resolveTimerRef.current = null;
    }

    setIsGlitching(true);

    // Optional haptic feedback for touch devices
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.([15, 20, 15]);
      } catch {
        // ignore if blocked by browser policy
      }
    }

    if (glitchTimerRef.current) clearInterval(glitchTimerRef.current);

    glitchTimerRef.current = setInterval(() => {
      // Scramble characters: some stay, some turn into symbols {}:()<>01
      setCharacters((prev) =>
        prev.map((orig, idx) => {
          // 80% chance to scramble into hacker symbol
          if (Math.random() < 0.8) {
            return HACKER_SYMBOLS[Math.floor(Math.random() * HACKER_SYMBOLS.length)];
          }
          // 20% chance to momentarily flash the true letter
          return TARGET_TEXT[idx];
        })
      );

      // Random jitter displacement
      setSliceOffset({
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 4,
      });

      // Chromatic aberration shift intensity
      setChromaticOffset(Math.floor(Math.random() * 6) + 2);

      // Randomly spawn particles
      if (Math.random() < 0.6) {
        spawnParticle();
      }
    }, 45);
  }, [spawnParticle]);

  // Sequentially resolve back to TARGET_TEXT ("CodeRank")
  const stopGlitching = useCallback(() => {
    if (glitchTimerRef.current) {
      clearInterval(glitchTimerRef.current);
      glitchTimerRef.current = null;
    }

    setSliceOffset({ x: 0, y: 0 });
    setChromaticOffset(0);

    let currentResolvedIndex = 0;

    if (resolveTimerRef.current) clearInterval(resolveTimerRef.current);

    resolveTimerRef.current = setInterval(() => {
      if (currentResolvedIndex >= TARGET_TEXT.length) {
        setCharacters(TARGET_TEXT.split(""));
        setIsGlitching(false);
        if (resolveTimerRef.current) {
          clearInterval(resolveTimerRef.current);
          resolveTimerRef.current = null;
        }
        return;
      }

      setCharacters((prev) => {
        const next = [...prev];
        // Lock in the resolved letter
        next[currentResolvedIndex] = TARGET_TEXT[currentResolvedIndex];
        // The remaining unresolved letters still glitch with symbols
        for (let i = currentResolvedIndex + 1; i < TARGET_TEXT.length; i++) {
          if (Math.random() < 0.6) {
            next[i] = HACKER_SYMBOLS[Math.floor(Math.random() * HACKER_SYMBOLS.length)];
          }
        }
        return next;
      });

      currentResolvedIndex++;
    }, 60);
  }, []);

  // Quick burst on click/tap
  const handleTriggerBurst = () => {
    startGlitching();

    // Spawn multiple particles
    for (let i = 0; i < 6; i++) {
      spawnParticle(15 + i * 14);
    }

    setTimeout(() => {
      stopGlitching();
    }, 900);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (glitchTimerRef.current) clearInterval(glitchTimerRef.current);
      if (resolveTimerRef.current) clearInterval(resolveTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={startGlitching}
      onMouseLeave={stopGlitching}
      onTouchStart={startGlitching}
      onTouchEnd={stopGlitching}
      onClick={handleTriggerBurst}
      className="group relative inline-block select-none cursor-pointer py-2"
      role="button"
      tabIndex={0}
      aria-label="Interactive Glitching CodeRank Title"
      title="Hover, touch or click to trigger hacker glitch matrix"
    >
      {/* Floating Hacker Bit Particles */}
      <div className="pointer-events-none absolute inset-0 -top-12 overflow-visible">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute font-mono font-bold text-sky-400 select-none transition-transform"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: p.opacity,
              fontSize: `${p.size}px`,
              textShadow: "0 0 4px rgba(56, 189, 248, 0.8)",
            }}
          >
            {p.char}
          </span>
        ))}
      </div>

      {/* Main Glitch Text Container */}
      <div className="relative inline-flex items-center">
        {/* Layer 1: Left Chromatic Displacement (Cyan / Sky) */}
        {isGlitching && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 select-none font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-sky-400/80 mix-blend-screen transition-transform"
            style={{
              transform: `translate(${-chromaticOffset}px, ${sliceOffset.y * 0.5}px) skew(${sliceOffset.x * 0.4}deg)`,
              clipPath: "polygon(0 15%, 100% 15%, 100% 45%, 0 45%, 0 65%, 100% 65%, 100% 85%, 0 85%)",
            }}
          >
            <div className="flex">
              {characters.map((char, i) => (
                <span
                  key={`chroma-l-${i}`}
                  className="inline-block text-center"
                  style={{ width: CHAR_WIDTHS[i] }}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Layer 2: Right Chromatic Displacement (Violet / Indigo) */}
        {isGlitching && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 select-none font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-indigo-400/80 mix-blend-screen transition-transform"
            style={{
              transform: `translate(${chromaticOffset}px, ${-sliceOffset.y * 0.5}px) skew(${-sliceOffset.x * 0.4}deg)`,
              clipPath: "polygon(0 0%, 100% 0%, 100% 25%, 0 25%, 0 55%, 100% 55%, 100% 75%, 0 75%, 0 100%, 100% 100%)",
            }}
          >
            <div className="flex">
              {characters.map((char, i) => (
                <span
                  key={`chroma-r-${i}`}
                  className="inline-block text-center"
                  style={{ width: CHAR_WIDTHS[i] }}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Layer 3: Horizontal Slicing Scanline */}
        {isGlitching && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-2 h-[2px] bg-sky-300/60 shadow-[0_0_8px_rgba(56,189,248,0.8)] z-20 animate-pulse"
            style={{
              top: `${Math.abs(sliceOffset.y * 20 + 30) % 90}%`,
              transform: `translateX(${sliceOffset.x * 2}px)`,
            }}
          />
        )}

        {/* Base Layer: Crisp White Structure-Preserved Text */}
        <h1
          className="relative z-10 font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white flex transition-transform duration-75"
          style={{
            transform: isGlitching
              ? `translate(${sliceOffset.x * 0.5}px, ${sliceOffset.y * 0.5}px)`
              : "none",
          }}
        >
          {characters.map((char, idx) => {
            const isSymbol = HACKER_SYMBOLS.includes(char);
            return (
              <span
                key={idx}
                className={`inline-block text-center transition-colors duration-75 ${
                  isSymbol
                    ? "text-sky-300 font-mono font-bold scale-105"
                    : "text-white"
                }`}
                style={{
                  width: CHAR_WIDTHS[idx],
                  transform: isSymbol ? `translateY(${(idx % 2 === 0 ? 1 : -1) * 1.5}px)` : "none",
                }}
              >
                {char}
              </span>
            );
          })}
        </h1>
      </div>
    </div>
  );
}
