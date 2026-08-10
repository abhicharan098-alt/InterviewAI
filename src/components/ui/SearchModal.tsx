'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { PRODUCTS } from '@/data/products';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, addToCart, setQuickViewProduct, formatPrice } = useStore();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const filteredProducts = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-3xl glass-card rounded-2xl p-6 z-10 border border-[#D4AF37]/30 shadow-2xl bg-[#0D0C12]"
        >
          {/* Search Input Box */}
          <div className="relative flex items-center border-b border-white/10 pb-4">
            <Search className="w-6 h-6 text-[#D4AF37] mr-3 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search by hair concern, 24K gold, keratin, caviar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-lg md:text-xl font-serif text-white placeholder-white/40 focus:outline-none"
            />
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Filter Tags */}
          <div className="py-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white/40 font-semibold uppercase tracking-wider">Popular Searches:</span>
            {['24K Gold', 'Biomimetic Keratin', 'Scalp Detox', 'Anti-Humidity Serum', 'Color Defense'].map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-3 py-1 rounded-full border border-white/10 text-white/70 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search Results Grid */}
          <div className="max-h-[60vh] overflow-y-auto mt-4 space-y-3">
            {filteredProducts.length === 0 ? (
              <p className="text-center py-8 text-white/50 text-sm">No formulations matched your query "{query}".</p>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 relative rounded-lg overflow-hidden shrink-0 bg-black/40 border border-white/10">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-white text-sm group-hover:text-[#D4AF37] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-white/60">{product.subtitle}</p>
                      <span className="text-xs font-mono font-semibold text-[#D4AF37]">{formatPrice(product.price)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setQuickViewProduct(product);
                        setIsSearchOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-white/20 text-xs text-white hover:border-[#D4AF37]"
                    >
                      Quick View
                    </button>
                    <button
                      onClick={() => addToCart(product)}
                      className="btn-luxury py-1.5 px-3 text-[10px]"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
