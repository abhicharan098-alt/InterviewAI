"use client";

import React from "react";

export function CinematicFire({ isHighStreak }: { isHighStreak: boolean }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl">
      {/* 
        We inject custom scoped keyframes using a style block to keep the animation logic 
        encapsulated and perfectly tuned without messing with tailwind.config.ts
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference) {
          .fire-glow { animation: fireBreathing 4s ease-in-out infinite alternate; }
          .fire-outer { animation: fireFlickerOuter 1.2s ease-in-out infinite alternate; }
          .fire-inner { animation: fireFlickerInner 0.6s ease-in-out infinite alternate; }
          .fire-core { animation: fireFlickerCore 0.3s ease-in-out infinite alternate; }
          .ember-1 { animation: emberRise 2.5s ease-in infinite; animation-delay: 0.2s; }
          .ember-2 { animation: emberRise 3s ease-in infinite; animation-delay: 1.5s; }
          .ember-3 { animation: emberRise 2.2s ease-in infinite; animation-delay: 0.8s; }
          .ember-4 { animation: emberRise 3.5s ease-in infinite; animation-delay: 2.1s; }
        }

        @keyframes fireBreathing {
          0% { opacity: 0.4; transform: scale(0.9); }
          100% { opacity: 0.7; transform: scale(1.1); }
        }

        @keyframes fireFlickerOuter {
          0% { transform: scale(1) translateY(0) skewX(-2deg); opacity: 0.8; filter: blur(2px); }
          50% { transform: scale(1.05) translateY(-2px) skewX(2deg); opacity: 0.9; filter: blur(3px); }
          100% { transform: scale(0.95) translateY(1px) skewX(-1deg); opacity: 0.7; filter: blur(2px); }
        }

        @keyframes fireFlickerInner {
          0% { transform: scale(1) translateY(0) skewX(1deg); opacity: 0.9; }
          33% { transform: scale(0.9) translateY(1px) skewX(-2deg); opacity: 0.8; }
          66% { transform: scale(1.1) translateY(-2px) skewX(2deg); opacity: 1; }
          100% { transform: scale(0.95) translateY(0) skewX(-1deg); opacity: 0.9; }
        }

        @keyframes fireFlickerCore {
          0% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 2px white); }
          50% { transform: scale(0.8); opacity: 0.8; filter: drop-shadow(0 0 1px white); }
          100% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 4px white); }
        }

        @keyframes emberRise {
          0% { transform: translateY(10px) translateX(0) scale(1); opacity: 1; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-20px) translateX(calc(10px * var(--dir))) scale(0.5); opacity: 0; }
        }
      `}} />

      {/* 1. OUTER ATMOSPHERIC GLOW */}
      <div 
        className={`absolute inset-0 rounded-2xl bg-gradient-radial from-orange-500/40 to-transparent blur-xl transition-all duration-1000 ${
          isHighStreak ? "scale-125 opacity-70" : "scale-100 opacity-40"
        } fire-glow motion-reduce:animate-none motion-reduce:opacity-50`}
      />

      <div className="relative flex h-8 w-8 items-end justify-center mb-1">
        {/* 2. OUTER FLAME (Deep Orange/Red) */}
        <div className="fire-outer absolute bottom-0 h-7 w-6 rounded-full bg-gradient-to-t from-red-600 to-orange-500 opacity-90 blur-[1px] mix-blend-screen motion-reduce:animate-none" 
             style={{ borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%' }} />

        {/* 3. INNER FLAME (Bright Orange/Yellow) */}
        <div className="fire-inner absolute bottom-[1px] h-5 w-4 rounded-full bg-gradient-to-t from-orange-500 to-yellow-400 opacity-100 blur-[0.5px] mix-blend-screen motion-reduce:animate-none"
             style={{ borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%' }} />

        {/* 4. HOT CORE (Yellow/White) */}
        <div className="fire-core absolute bottom-[2px] h-3 w-2.5 rounded-full bg-gradient-to-t from-yellow-200 to-white opacity-100 mix-blend-screen motion-reduce:animate-none"
             style={{ borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%' }} />

        {/* 5. EMBERS */}
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          <div className="ember-1 absolute bottom-2 left-2 h-1 w-1 rounded-full bg-yellow-300 blur-[0.5px] opacity-0" style={{ "--dir": 1 } as React.CSSProperties} />
          <div className="ember-2 absolute bottom-1 left-4 h-1 w-1 rounded-full bg-orange-400 blur-[0.5px] opacity-0" style={{ "--dir": -1 } as React.CSSProperties} />
          <div className="ember-3 absolute bottom-3 left-3 h-[3px] w-[3px] rounded-full bg-yellow-100 blur-[0.5px] opacity-0" style={{ "--dir": 1.5 } as React.CSSProperties} />
          {isHighStreak && (
            <div className="ember-4 absolute bottom-1 left-5 h-1 w-1 rounded-full bg-orange-300 blur-[0.5px] opacity-0" style={{ "--dir": -0.5 } as React.CSSProperties} />
          )}
        </div>
      </div>
    </div>
  );
}
