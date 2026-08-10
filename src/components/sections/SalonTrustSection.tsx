'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Building2, Globe2, Sparkles, CheckCircle2 } from 'lucide-react';
import { SALON_PARTNERS, SALON_STATS } from '@/data/products';

export const SalonTrustSection: React.FC = () => {
  return (
    <section className="py-20 border-y border-[#D4AF37]/20 bg-[#0A090D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            Global Salon Network
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold">
            Trusted by the World's Finest Hair Ateliers
          </h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            From Rue du Faubourg Saint-Honoré in Paris to Ginza Tokyo, top celebrity stylists rely on Cabelo Chave.
          </p>
        </div>

        {/* Counter Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-2xl glass-card text-center space-y-1">
            <span className="font-serif text-3xl md:text-4xl font-bold gold-gradient-text">
              {SALON_STATS.salonsCount}
            </span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-white/70">
              Partner Salons
            </span>
          </div>

          <div className="p-6 rounded-2xl glass-card text-center space-y-1">
            <span className="font-serif text-3xl md:text-4xl font-bold gold-gradient-text">
              {SALON_STATS.countriesCount}
            </span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-white/70">
              Countries Worldwide
            </span>
          </div>

          <div className="p-6 rounded-2xl glass-card text-center space-y-1">
            <span className="font-serif text-3xl md:text-4xl font-bold gold-gradient-text">
              {SALON_STATS.treatmentsCount}
            </span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-white/70">
              Pro Treatments Done
            </span>
          </div>

          <div className="p-6 rounded-2xl glass-card text-center space-y-1">
            <span className="font-serif text-3xl md:text-4xl font-bold gold-gradient-text">
              {SALON_STATS.satisfactionRate}
            </span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-white/70">
              Cuticle Repair Score
            </span>
          </div>
        </div>

        {/* Salon Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SALON_PARTNERS.map((salon, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-4 rounded-xl glass-card border border-white/10 hover:border-[#D4AF37]/40 relative overflow-hidden"
            >
              <div className="h-32 relative rounded-lg overflow-hidden mb-3">
                <Image
                  src={salon.image}
                  alt={salon.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase text-[#D4AF37] px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                  {salon.city}
                </span>
              </div>

              <h4 className="font-serif font-bold text-sm text-white group-hover:text-[#D4AF37] transition-colors">
                {salon.name}
              </h4>
              <p className="text-[11px] text-white/50">{salon.country}</p>

              <div className="flex items-center space-x-1 text-[10px] text-emerald-400 mt-2">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Salon Atelier</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
