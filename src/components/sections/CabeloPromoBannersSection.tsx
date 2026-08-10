'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, Gift } from 'lucide-react';

export const CabeloPromoBannersSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-[#07070A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
            Exclusive Salon Offers & Collections
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-black dark:text-white">
            Curated Professional Treatment Banners
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Banner 1: Anti-Dandruff */}
          <div className="relative rounded-3xl overflow-hidden min-h-[380px] flex flex-col justify-end p-8 md:p-12 text-white border border-white/10 group shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=85"
              alt="Anti-Dandruff Treatment"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-0" />

            <div className="relative z-10 space-y-4">
              <span className="px-3 py-1 bg-[#008080] text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-block">
                Scalp Micro-Biome Detox
              </span>
              <h3 className="font-serif text-3xl md:text-4xl font-bold">
                Anti – Dandruff Treatment
              </h3>
              <p className="text-xs text-gray-300 max-w-md leading-relaxed">
                Harness the combined power of Tea Tree, Mint, and Piroctone Olamine to eliminate flakes and revitalize your scalp with lasting comfort.
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <Link
                  href="/shop?category=ampoule"
                  className="inline-flex items-center space-x-2 bg-white text-black font-extrabold px-6 py-3 rounded-full text-xs uppercase tracking-widest hover:bg-[#D4AF37] transition-all shadow-lg"
                >
                  <span>Explore Series</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Banner 2: Hair Fall Control */}
          <div className="relative rounded-3xl overflow-hidden min-h-[380px] flex flex-col justify-end p-8 md:p-12 text-white border border-white/10 group shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=85"
              alt="Hair Fall Control Treatment"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-0" />

            <div className="relative z-10 space-y-4">
              <span className="px-3 py-1 bg-[#E07A5F] text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-block">
                Root Anchoring System
              </span>
              <h3 className="font-serif text-3xl md:text-4xl font-bold">
                Hair Fall Control Treatment
              </h3>
              <p className="text-xs text-gray-300 max-w-md leading-relaxed">
                Enriched with wild ginger & micro-ampoules to gently cleanse and anchor hair roots. Restores moisture for 98% less breakage.
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <Link
                  href="/shop?category=botox"
                  className="inline-flex items-center space-x-2 bg-white text-black font-extrabold px-6 py-3 rounded-full text-xs uppercase tracking-widest hover:bg-[#D4AF37] transition-all shadow-lg"
                >
                  <span>Discover Solution</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Banner 3: 24K Gold Nano-Elixir */}
          <div className="relative rounded-3xl overflow-hidden min-h-[380px] flex flex-col justify-end p-8 md:p-12 text-white border border-[#D4AF37]/30 group shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1608248597260-652163585786?auto=format&fit=crop&w=1000&q=85"
              alt="24K Gold Nano-Elixir"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-0" />

            <div className="relative z-10 space-y-4">
              <span className="px-3 py-1 bg-[#D4AF37] text-black rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>24K Gold Nano-Tech</span>
              </span>
              <h3 className="font-serif text-3xl md:text-4xl font-bold text-amber-200">
                24K Gold Hair & Scalp Elixir
              </h3>
              <p className="text-xs text-gray-300 max-w-md leading-relaxed">
                Colloidal 24-karat gold particles diffuse deep into cortex micro-fractures for zero-frizz radiance and glass hair reflection.
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <Link
                  href="/shop?category=neoplex"
                  className="inline-flex items-center space-x-2 bg-[#D4AF37] text-black font-extrabold px-6 py-3 rounded-full text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                >
                  <span>Order 24K Elixir</span>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </Link>
              </div>
            </div>
          </div>

          {/* Banner 4: Neoplex Pro Salon Kit */}
          <div className="relative rounded-3xl overflow-hidden min-h-[380px] flex flex-col justify-end p-8 md:p-12 text-white border border-emerald-500/30 group shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1000&q=85"
              alt="Neoplex Pro Salon Kit"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-0" />

            <div className="relative z-10 space-y-4">
              <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-flex items-center space-x-1">
                <Gift className="w-3 h-3" />
                <span>Pro Salon Kit &bull; Save 25%</span>
              </span>
              <h3 className="font-serif text-3xl md:text-4xl font-bold text-emerald-200">
                Neoplex Protein Master Bundle
              </h3>
              <p className="text-xs text-gray-300 max-w-md leading-relaxed">
                Complete 4-step treatment kit includes Pre-Shampoo, Protein Sealant, Moisture Conditioner, and Heat Shield.
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <Link
                  href="/shop?category=neoplex"
                  className="inline-flex items-center space-x-2 bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-full text-xs uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all shadow-lg"
                >
                  <span>Claim 25% VIP Discount</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

