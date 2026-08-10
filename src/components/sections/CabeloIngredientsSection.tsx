'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

const INGREDIENTS = [
  { name: 'Green Caviar', description: 'Rich in amino acids and marine minerals to deeply nourish cortex fibers.' },
  { name: 'Pure Argan Oil', description: 'Cold-pressed Moroccan oil providing essential fatty acids and liquid gloss.' },
  { name: 'Hyaluronic Acid', description: 'Attracts 1,000x its weight in moisture to plump dehydrated hair shafts.' },
  { name: 'Glycolic Acid', description: 'Smooths cuticle scales and locks in hair color vibrancy.' },
  { name: 'Cocoa Butter', description: 'Intensive lipid barrier protecting hair against humidity and breakage.' },
  { name: 'Shea Butter', description: 'Deep botanical conditioning for cashmere softness.' },
  { name: 'Avocado Extract', description: 'Rich in Vitamins A, D, and E to fortify fragile hair ends.' }
];

export const CabeloIngredientsSection: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-[#07070A] text-black dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold tracking-[0.25em] text-[#0F6856] dark:text-[#D4AF37] uppercase">
            Active Bio-Botanicals
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold">
            INGREDIENTS: The Special Formula
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            A potent blend of natural ingredients for ultimate nourishment and cellular revitalization.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {INGREDIENTS.map((ing, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-gray-50 dark:bg-[#111017] border border-gray-200 dark:border-white/10 text-left space-y-2 hover:border-[#0F6856] dark:hover:border-[#D4AF37] transition-colors"
            >
              <div className="flex items-center space-x-2 text-[#0F6856] dark:text-[#D4AF37]">
                <Sparkles className="w-4 h-4" />
                <h3 className="font-serif text-lg font-bold text-black dark:text-white">{ing.name}</h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {ing.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
