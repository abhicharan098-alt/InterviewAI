'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Sparkles, ShieldCheck, Dna, Award, Globe, Leaf } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#07070A] text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />

      <main>
        {/* Hero Banner */}
        <section className="relative py-28 overflow-hidden border-b border-[#D4AF37]/20">
          <div className="absolute inset-0 bg-gradient-to-b from-[#111018] to-[#07070A] opacity-90" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#D4AF37]">
              The Science of Haute Hair Care
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold max-w-4xl mx-auto leading-tight gold-gradient-text">
              Key Solutions for Hair: Engineered in Zurich, Trusted Worldwide
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
              Cabelo Chave was founded on a singular trichological objective: to restore damaged cortical bonds, seal light reflection, and deliver formaldehyde-free organic realignment for luxury salon professionals.
            </p>
          </div>
        </section>

        {/* Pillars Grid */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-2xl glass-card border border-white/10 space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                <Dna className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-serif text-xl font-bold">Biomimetic Hydrolyzed Peptides</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Our Swiss formulation reconstructs broken disulfide bonds at the core of the cortex without weight or residue.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-2xl glass-card border border-white/10 space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-serif text-xl font-bold">100% Formaldehyde Free</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Organic realignment powered by nano-technology amino acids ensuring safe application for master stylists and clients.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-2xl glass-card border border-white/10 space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                <Globe className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-serif text-xl font-bold">1,420+ Salon Ateliers</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                From Paris to Tokyo, luxury master ateliers select Cabelo Chave for high-gloss, long-lasting hair transformation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center border-t border-white/10 bg-[#0E0D14]">
          <div className="max-w-3xl mx-auto px-4 space-y-6">
            <h2 className="font-serif text-3xl font-bold">Experience Salon-Grade Transformation</h2>
            <div className="flex justify-center space-x-4">
              <Link href="/shop" className="btn-luxury py-3 px-8 text-xs">
                Explore Full Catalog
              </Link>
              <Link href="/professional" className="btn-luxury-outline py-3 px-8 text-xs">
                Salon Partner Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
