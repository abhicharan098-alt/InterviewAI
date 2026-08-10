'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, ShieldAlert, TrendingDown, Wind, Sun, Activity, ArrowRight, Sparkles } from 'lucide-react';
import { HAIR_PROBLEMS, PRODUCTS } from '@/data/products';
import { useStore } from '@/context/StoreContext';

const ICON_MAP: Record<string, React.ReactNode> = {
  Droplet: <Droplet className="w-6 h-6 text-[#D4AF37]" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6 text-red-400" />,
  TrendingDown: <TrendingDown className="w-6 h-6 text-amber-400" />,
  Wind: <Wind className="w-6 h-6 text-[#D4AF37]" />,
  Sun: <Sun className="w-6 h-6 text-amber-300" />,
  Activity: <Activity className="w-6 h-6 text-emerald-400" />
};

export const HairProblemsSection: React.FC = () => {
  const { setQuickViewProduct, setSelectedConcern } = useStore();

  const handleSelectConcern = (concernId: string, recommendedId: string) => {
    setSelectedConcern(concernId as any);
    const product = PRODUCTS.find((p) => p.id === recommendedId);
    if (product) {
      setQuickViewProduct(product);
    }
  };

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="text-center space-y-3 mb-16">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
          Targeted Molecular Solutions
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-bold">
          Select Your Specific Hair Concern
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Every hair concern requires a precise balance of lipophilic lipids, amino acid weight, and cuticle seals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {HAIR_PROBLEMS.map((item, idx) => {
          const recProduct = PRODUCTS.find((p) => p.id === item.recommendedId);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -6, scale: 1.01 }}
              onClick={() => handleSelectConcern(item.id, item.recommendedId)}
              className="p-6 rounded-2xl glass-card border border-white/10 hover:border-[#D4AF37]/50 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
            >
              {/* Subtle Ambient Color Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700`} />

              <div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-[#D4AF37] transition-colors">
                  {ICON_MAP[item.icon]}
                </div>

                <h3 className="font-serif text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-white/60 mt-2 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>

              {recProduct && (
                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[#D4AF37]">
                      Recommended Formulation
                    </span>
                    <span className="font-serif text-xs font-semibold text-white truncate max-w-[180px] block">
                      {recProduct.name}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-colors">
                    <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:text-black" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
