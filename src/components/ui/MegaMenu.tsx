'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, Shield, Dna, Building2, Flame } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { HAIR_PROBLEMS } from '@/data/products';

export const MegaMenu: React.FC = () => {
  const { isMegaMenuOpen, setIsMegaMenuOpen, setIsAIAdvisorOpen, setSelectedConcern } = useStore();

  if (!isMegaMenuOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex flex-col"
      >
        {/* Header Bar */}
        <div className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-[#D4AF37]/20">
          <div className="flex items-center space-x-3">
            <span className="font-serif text-2xl font-bold gold-gradient-text">CABELO CHAVE</span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37]/70 font-sans border-l border-[#D4AF37]/30 pl-3">
              Editorial Navigation
            </span>
          </div>

          <button
            onClick={() => setIsMegaMenuOpen(false)}
            className="p-3 text-white/70 hover:text-[#D4AF37] hover:rotate-90 transition-all rounded-full border border-white/10 hover:border-[#D4AF37]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mega Menu Content Grid */}
        <div className="max-w-7xl mx-auto w-full px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10 overflow-y-auto">
          {/* Column 1: Collections */}
          <div className="space-y-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              Product Collections
            </h3>
            <ul className="space-y-3 font-serif text-xl">
              <li>
                <Link
                  href="/shop"
                  onClick={() => setIsMegaMenuOpen(false)}
                  className="hover:gold-gradient-text transition-colors flex items-center justify-between group"
                >
                  <span>24K Gold Elixirs</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#D4AF37]" />
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  onClick={() => setIsMegaMenuOpen(false)}
                  className="hover:gold-gradient-text transition-colors flex items-center justify-between group"
                >
                  <span>Biomimetic Cleansing</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#D4AF37]" />
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  onClick={() => setIsMegaMenuOpen(false)}
                  className="hover:gold-gradient-text transition-colors flex items-center justify-between group"
                >
                  <span>Cortex Masques</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#D4AF37]" />
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  onClick={() => setIsMegaMenuOpen(false)}
                  className="hover:gold-gradient-text transition-colors flex items-center justify-between group"
                >
                  <span>Scalp Microbiome</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#D4AF37]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Hair Concerns */}
          <div className="space-y-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              Hair Concerns
            </h3>
            <div className="space-y-2 text-sm">
              {HAIR_PROBLEMS.map((concern) => (
                <Link
                  key={concern.id}
                  href="/shop"
                  onClick={() => {
                    setSelectedConcern(concern.id as any);
                    setIsMegaMenuOpen(false);
                  }}
                  className="block p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-[#D4AF37]/30 transition-all"
                >
                  <p className="font-semibold text-white/90">{concern.title}</p>
                  <p className="text-xs text-white/50">{concern.subtitle}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Science & Salon Partners */}
          <div className="space-y-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              Science & Salons
            </h3>
            <div className="space-y-4 text-sm text-white/80">
              <div className="p-4 rounded-xl glass-card flex items-start space-x-3">
                <Dna className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Biomimetic K18 Peptide</h4>
                  <p className="text-xs text-white/60 mt-1">Re-links broken keratin bonds deep in hair fiber.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl glass-card flex items-start space-x-3">
                <Building2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Salons Network</h4>
                  <p className="text-xs text-white/60 mt-1">5,000+ elite hair labs in Paris, Tokyo, LA, Milan.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: AI Advisor Card */}
          <div className="p-6 rounded-2xl glass-card border border-[#D4AF37]/40 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#1A1813] to-[#0A0A0D]">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
              </div>
              <h4 className="font-serif text-xl font-bold text-white mb-2">AI Hair Diagnostic</h4>
              <p className="text-xs text-white/70 leading-relaxed mb-6">
                Receive a bespoke 5-step salon prescription engineered specifically for your hair texture, porosity, and damage level.
              </p>
            </div>

            <button
              onClick={() => {
                setIsMegaMenuOpen(false);
                setIsAIAdvisorOpen(true);
              }}
              className="btn-luxury w-full text-center text-xs tracking-widest relative z-10"
            >
              Start Diagnostic
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
