'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sliders, Sparkles, CheckCircle2 } from 'lucide-react';

export const BeforeAfterSection: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    updatePosition(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
  };

  return (
    <section id="transformation" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-16">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
          Clinical Proof & Results
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-bold">
          Interactive Hair Transformation
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Drag the interactive slider below to inspect the molecular cortex restoration after 1 application of Elixir Royal Luxe 24K.
        </p>
      </div>

      {/* Interactive Split View Slider Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative h-[450px] md:h-[600px] w-full rounded-2xl overflow-hidden glass-card border border-[#D4AF37]/30 select-none cursor-ew-resize shadow-2xl touch-none"
      >
        {/* AFTER Image (Full Layer underneath) */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=90"
            alt="After 24K Gold Hair Treatment"
            fill
            className="object-cover"
          />
          <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-[#D4AF37]/40 text-xs font-serif font-bold text-[#D4AF37] flex items-center space-x-2 z-10">
            <Sparkles className="w-4 h-4" />
            <span>AFTER: 24K Liquid Gold Rejuvenation</span>
          </div>
        </div>

        {/* BEFORE Image (Clipped Layer on top via clipPath) */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1600&q=90"
            alt="Before Hair Treatment"
            fill
            className="object-cover"
          />
          <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-serif font-bold text-white z-10">
            BEFORE: Bleached & Heat Damaged
          </div>
        </div>

        {/* Divider Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-[#D4AF37] z-20 shadow-[0_0_20px_rgba(212,175,55,0.8)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#D4AF37] text-black font-bold shadow-xl flex items-center justify-center border-2 border-black">
            <Sliders className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Clinical Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="p-6 rounded-2xl glass-card text-center space-y-2 border border-white/10">
          <span className="font-serif text-3xl font-bold gold-gradient-text">+98.4%</span>
          <span className="block text-xs font-semibold uppercase tracking-wider text-white">
            Light Reflection Index
          </span>
          <p className="text-[11px] text-white/50">Measured via trichological goniophotometer.</p>
        </div>

        <div className="p-6 rounded-2xl glass-card text-center space-y-2 border border-white/10">
          <span className="font-serif text-3xl font-bold gold-gradient-text">99.1%</span>
          <span className="block text-xs font-semibold uppercase tracking-wider text-white">
            Breakage Prevention
          </span>
          <p className="text-[11px] text-white/50">Tensile resistance during 5,000 brush strokes.</p>
        </div>

        <div className="p-6 rounded-2xl glass-card text-center space-y-2 border border-white/10">
          <span className="font-serif text-3xl font-bold gold-gradient-text">72 Hours</span>
          <span className="block text-xs font-semibold uppercase tracking-wider text-white">
            Anti-Humidity Defense
          </span>
          <p className="text-[11px] text-white/50">Tested at 90% relative humidity ambient chamber.</p>
        </div>
      </div>
    </section>
  );
};
