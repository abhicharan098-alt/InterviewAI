'use client';

import React from 'react';
import { Leaf, ShieldCheck, Sun, HeartHandshake } from 'lucide-react';

const PILLARS = [
  {
    icon: Leaf,
    title: 'Powered by Natural Ingredients',
    description: 'Infused with nourishing ingredients like argan oil, green caviar and botanical extracts for healthy, vibrant hair.'
  },
  {
    icon: ShieldCheck,
    title: 'Free from Harsh Chemicals',
    description: 'No formaldehyde, sulfates, or parabens — just clean, safe formulas for everyday care.'
  },
  {
    icon: Sun,
    title: 'UV & Environmental Defense',
    description: 'Helps shield hair from sun damage, UVA/UVB rays, pollution, and everyday environmental stressors.'
  },
  {
    icon: HeartHandshake,
    title: '100% Cruelty-Free & Ethical',
    description: 'We never test on animals — our products are 100% cruelty-free and ethically manufactured.'
  }
];

export const CabeloSpecialitySection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-[#0B0A0E] text-black dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold tracking-[0.25em] text-[#0F6856] dark:text-[#D4AF37] uppercase">
            Cabelo Chave Professional Standard
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold">
            Speciality of Our Hair Care Range
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Crafted for healthier, stronger hair — powered by science and nature, without the nasties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#121118] p-8 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 space-y-4 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0F6856]/10 dark:bg-[#D4AF37]/15 text-[#0F6856] dark:text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 stroke-[1.75]" />
                </div>

                <h3 className="font-serif text-xl font-bold">{pillar.title}</h3>

                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
