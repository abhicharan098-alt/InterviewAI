'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, ShoppingBag, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const CompareDrawer: React.FC = () => {
  const { compareList, toggleCompare, addToCart, formatPrice, isCompareOpen, setIsCompareOpen } = useStore();
  const [isFullView, setIsFullView] = useState(false);

  if (compareList.length === 0 && !isCompareOpen) return null;

  if (compareList.length === 0 && isCompareOpen) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCompareOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md glass-card rounded-2xl p-8 z-10 bg-[#0C0B10] border border-[#D4AF37]/30 text-center text-white space-y-4 shadow-2xl"
          >
            <button
              onClick={() => setIsCompareOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SlidersHorizontal className="w-12 h-12 text-[#D4AF37]/40 mx-auto stroke-1" />
            <h3 className="font-serif text-xl font-bold gold-gradient-text">Comparison Vault Empty</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Click the <SlidersHorizontal className="w-3.5 h-3.5 inline mx-1 text-[#D4AF37]" /> icon on any product card or quick view modal to compare up to 3 formulations side by side.
            </p>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <>
      {/* Bottom Floating Bar */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#0C0B10]/95 border-t border-[#D4AF37]/40 backdrop-blur-xl shadow-2xl p-4 text-white"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SlidersHorizontal className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <h4 className="font-serif font-bold text-sm gold-gradient-text uppercase">Formula Comparison Vault</h4>
                <p className="text-[11px] text-white/50">{compareList.length} of 3 formulations selected</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {compareList.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center space-x-2 bg-white/5 p-1.5 rounded-xl border border-white/10"
                  >
                    <div className="w-10 h-10 relative rounded-lg overflow-hidden shrink-0">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-white max-w-[120px] truncate">{product.name}</p>
                      <p className="text-[10px] text-[#D4AF37] font-mono">{formatPrice(product.price)}</p>
                    </div>
                    <button
                      onClick={() => toggleCompare(product)}
                      className="text-white/40 hover:text-red-400 p-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsFullView(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold tracking-wider uppercase border border-white/15 transition-colors"
              >
                Inspect Specs
              </button>

              <button
                onClick={() => compareList.forEach((p) => addToCart(p))}
                className="btn-luxury text-xs py-2 px-4 whitespace-nowrap"
              >
                Add All to Bag
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Full Modal Breakdown View */}
      <AnimatePresence>
        {isFullView && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFullView(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl glass-card rounded-2xl p-6 md:p-8 z-10 bg-[#0C0B10] border border-[#D4AF37]/30 shadow-2xl text-white my-8 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <SlidersHorizontal className="w-6 h-6 text-[#D4AF37]" />
                  <h3 className="font-serif text-2xl font-bold gold-gradient-text">Side-by-Side Formula Matrix</h3>
                </div>
                <button
                  onClick={() => setIsFullView(false)}
                  className="p-2 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {compareList.map((prod) => (
                  <div key={prod.id} className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="relative h-44 rounded-xl overflow-hidden bg-black/40 border border-white/10">
                        <Image src={prod.image} alt={prod.name} fill className="object-cover" />
                      </div>
                      <h4 className="font-serif font-bold text-base text-white">{prod.name}</h4>
                      <p className="text-xs text-[#D4AF37] font-semibold">{prod.subtitle}</p>
                      <p className="font-serif text-xl font-bold text-white">{formatPrice(prod.price)}</p>
                      <p className="text-xs text-white/70 leading-relaxed">{prod.description}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                      <p className="text-[11px] uppercase font-bold text-white/50">Clinical Result Highlights:</p>
                      {prod.clinicalResults.map((r, i) => (
                        <div key={i} className="flex justify-between text-white/80">
                          <span>{r.metric}:</span>
                          <span className="font-bold text-[#D4AF37]">{r.value}</span>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          addToCart(prod);
                          setIsFullView(false);
                        }}
                        className="btn-luxury w-full py-2.5 text-xs font-bold mt-4"
                      >
                        Add to Shopping Bag
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
