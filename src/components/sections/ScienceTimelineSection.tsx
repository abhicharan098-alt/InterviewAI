'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dna, Sparkles, Shield, Droplet, Zap, FlaskConical, Atom } from 'lucide-react';

interface ScienceStep {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  stat: string;
  statLabel: string;
}

export const ScienceTimelineSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps: ScienceStep[] = [
    {
      year: 'PHASE 01',
      title: '24K Colloidal Gold Bio-Fermentation',
      subtitle: 'Molecular Light Reflection & Cortex Anchoring',
      description: 'Pure 99.9% Swiss gold micro-flakes undergo bio-fermentation into sub-nanometer colloidal ions. These ions nest within porous keratin crevices, imparting an optical mirror glaze while sealing moisture.',
      icon: <Sparkles className="w-6 h-6 text-[#D4AF37]" />,
      stat: '99.9%',
      statLabel: 'Bio-Gold Purity'
    },
    {
      year: 'PHASE 02',
      title: 'Biomimetic K18 Peptide Chain',
      subtitle: 'Re-linking Broken Disulfide Bonds',
      description: 'Our proprietary oligopeptide sequence matches the precise amino acid footprint of natural human keratin. It travels 3 layers deep past the cuticle to reconnect broken polypeptide chains.',
      icon: <Dna className="w-6 h-6 text-[#D4AF37]" />,
      stat: '100%',
      statLabel: 'Peptide Affinity'
    },
    {
      year: 'PHASE 03',
      title: 'Cold-Pressed Himalayan Marula',
      subtitle: 'Lipophilic Lipid Barrier Encapsulation',
      description: 'Extracted at first cold press in Madagascar high altitudes. Contains 60% higher concentration of essential oleic acids than standard argan oil, offering weightless silk coating.',
      icon: <Droplet className="w-6 h-6 text-[#D4AF37]" />,
      stat: '60%',
      statLabel: 'Higher Oleic Concentration'
    },
    {
      year: 'PHASE 04',
      title: 'Black Caviar & Prebiotic Microbiome',
      subtitle: 'Follicle Rejuvenation & Scalp Detox',
      description: 'Rich in marine omega-3 fatty acids and zinc amino complexes. Restores scalp pH balance to 5.5 while clearing follicle sebum impactions for optimal new strand growth.',
      icon: <Atom className="w-6 h-6 text-[#D4AF37]" />,
      stat: '5.5 pH',
      statLabel: 'Optimal Scalp Equilibrium'
    }
  ];

  return (
    <section id="science" className="py-24 bg-[#08070B] border-t border-[#D4AF37]/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Biotechnology & Clinical Science</span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-bold">
            The Science Behind The Shine
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Discover the 4-phase molecular technology engineered in our Zurich trichology lab.
          </p>
        </div>

        {/* Timeline Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`p-5 rounded-2xl text-left transition-all ${
                activeStep === idx
                  ? 'glass-card border-[#D4AF37] shadow-xl scale-102 bg-[#141219]'
                  : 'bg-white/5 border border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#D4AF37]">
                  {step.year}
                </span>
                <div className={`p-2 rounded-lg ${activeStep === idx ? 'bg-[#D4AF37]/20' : 'bg-white/5'}`}>
                  {step.icon}
                </div>
              </div>
              <h4 className="font-serif font-bold text-sm text-white line-clamp-1">{step.title}</h4>
            </button>
          ))}
        </div>

        {/* Active Science Display Card */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-3xl p-8 md:p-12 border border-[#D4AF37]/40 bg-gradient-to-br from-[#121017] to-[#07060A] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-8 space-y-5">
            <span className="text-xs font-mono font-bold text-[#D4AF37] tracking-widest uppercase">
              {steps[activeStep].year} &bull; Clinical Formulation
            </span>
            <h3 className="font-serif text-2xl md:text-4xl font-bold gold-gradient-text">
              {steps[activeStep].title}
            </h3>
            <p className="text-sm text-[#D4AF37] font-medium">{steps[activeStep].subtitle}</p>
            <p className="text-sm text-white/70 leading-relaxed font-sans">
              {steps[activeStep].description}
            </p>
          </div>

          <div className="lg:col-span-4 p-8 rounded-2xl bg-black/50 border border-[#D4AF37]/30 text-center space-y-2 shadow-2xl">
            <span className="block font-serif text-5xl font-bold gold-gradient-text">
              {steps[activeStep].stat}
            </span>
            <span className="block text-xs font-bold uppercase tracking-wider text-white">
              {steps[activeStep].statLabel}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
