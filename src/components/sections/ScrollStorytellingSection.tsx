'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Dna, Sparkles, ShieldCheck } from 'lucide-react';

export const ScrollStorytellingSection: React.FC = () => {
  const pillars = [
    {
      number: '01',
      title: 'Sub-Nanometer 24K Bio-Gold',
      subtitle: 'Colloidal Light Reflection',
      description: 'Bio-fermented 99.9% Swiss gold micro-ions nest inside microscopic cuticle fissures, creating a weightless mirror-finish glaze that reflects light at multi-dimensional angles.',
      icon: <Sparkles className="w-5 h-5 text-[#D4AF37]" />,
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=85'
    },
    {
      number: '02',
      title: 'Biomimetic K18 Peptide Chain',
      subtitle: 'Deep Cortex Reconstruction',
      description: 'Engineered in our Zurich laboratory, this exact amino acid sequence penetrates 3 layers deep past the cuticle to reconnect severed polypeptide chains damaged by color processing and heat.',
      icon: <Dna className="w-5 h-5 text-[#D4AF37]" />,
      image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=85'
    },
    {
      number: '03',
      title: 'Hydrophobic Cuticle Silk Veil',
      subtitle: '72-Hour Anti-Humidity Shield',
      description: 'Cold-pressed Himalayan marula oil creates an imperceptible hydrophobic seal over each strand, locking in essential moisture while locking out 100% ambient humidity.',
      icon: <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />,
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=85'
    }
  ];

  return (
    <section className="py-28 bg-[#070709] border-t border-[#D4AF37]/15 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-20">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
            Editorial Narrative
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold">
            The Three Pillars of Cabelo Chave
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto font-sans">
            How Swiss biotechnology and precious botanicals converge to restore compromised hair fibers.
          </p>
        </div>

        <div className="space-y-24">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={`lg:col-span-6 space-y-5 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-[#D4AF37] tracking-widest">
                    PILLAR {pillar.number}
                  </span>
                  <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                    {pillar.icon}
                  </div>
                </div>

                <h3 className="font-serif text-3xl md:text-4xl font-bold text-white">
                  {pillar.title}
                </h3>
                <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                  {pillar.subtitle}
                </p>
                <p className="text-sm text-white/70 leading-relaxed font-sans">
                  {pillar.description}
                </p>
              </div>

              <div className={`lg:col-span-6 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="h-[360px] md:h-[440px] relative rounded-2xl overflow-hidden glass-card border border-white/10 group">
                  <Image
                    src={pillar.image}
                    alt={pillar.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
