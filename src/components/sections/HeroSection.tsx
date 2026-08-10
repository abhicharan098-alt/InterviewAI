'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Award } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const HeroBottle3D = dynamic(() => import('@/components/canvas/HeroBottle3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border border-[#D4AF37] border-t-transparent animate-spin" />
    </div>
  ),
});

export const HeroSection: React.FC = () => {
  const { setIsAIAdvisorOpen } = useStore();

  return (
    <section className="relative min-h-[85vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Editorial Copy */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 backdrop-blur-md"
          >
            <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#D4AF37]">
              Trusted by 5,000+ Master Salons Worldwide
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-serif text-4xl sm:text-6xl xl:text-7xl font-bold leading-[1.08] tracking-tight"
          >
            Cellular Precision. <br />
            <span className="gold-gradient-text italic font-normal">Salon Perfection.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed font-sans"
          >
            Formulated in Zurich with 24K bio-colloidal gold and biomimetic silk peptides. Reconnects broken cortex bonds for mirror shine.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
          >
            <Link href="/shop" className="btn-luxury flex items-center space-x-2">
              <span>Discover Formulations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => setIsAIAdvisorOpen(true)}
              className="btn-luxury-outline flex items-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Take Hair Diagnostic</span>
            </button>
          </motion.div>

          {/* Restrained Metric Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-8 grid grid-cols-3 gap-6 border-t border-[#D4AF37]/15 max-w-lg mx-auto lg:mx-0 text-left"
          >
            <div>
              <span className="font-serif text-lg font-bold text-white">24K Bio-Gold</span>
              <span className="block text-[10px] uppercase text-muted-foreground mt-0.5">Swiss Purity</span>
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-white">0% Sulfate</span>
              <span className="block text-[10px] uppercase text-muted-foreground mt-0.5">Biomimetic Silk</span>
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-white">450°F Shield</span>
              <span className="block text-[10px] uppercase text-muted-foreground mt-0.5">Thermal Defense</span>
            </div>
          </motion.div>
        </div>

        {/* Right 3D Studio Bottle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="lg:col-span-6 h-[460px] lg:h-[580px] relative w-full"
        >
          <HeroBottle3D />
        </motion.div>
      </div>
    </section>
  );
};
