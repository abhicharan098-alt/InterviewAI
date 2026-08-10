'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingBag, Eye, SlidersHorizontal, Sparkles, CheckCircle2 } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { useStore } from '@/context/StoreContext';
import { HairConcernType } from '@/types';

export const ProductCollectionSection: React.FC = () => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    setQuickViewProduct,
    formatPrice,
    selectedConcern,
    setSelectedConcern
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Formulations' },
    { id: 'neoplex', label: 'Neoplex Series' },
    { id: 'neoplastia', label: 'Neoplastia' },
    { id: 'botox', label: 'Hair Botox' },
    { id: 'keratin', label: 'Keratin' },
    { id: 'argan', label: 'Argan Oil' },
    { id: 'damage', label: 'Cortex Repair' },
    { id: 'styling', label: 'Styling & Clay' },
    { id: 'scalp', label: 'Scalp & Anti-Dandruff' },
    { id: 'tools', label: 'Salon Tools' }
  ];

  const filteredProducts = PRODUCTS.filter((product) => {
    if (selectedConcern && product.concern !== selectedConcern) return false;
    if (activeCategory !== 'all' && product.category !== activeCategory) return false;
    return true;
  });

  return (
    <section className="py-24 bg-[#0A090E] relative overflow-hidden border-t border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              Haute Hair Care Catalog
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold">
              The Flagship Collection
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedConcern && (
              <button
                onClick={() => setSelectedConcern(null)}
                className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold border border-red-500/40"
              >
                Clear Concern Filter ×
              </button>
            )}

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
                    : 'glass-panel text-white/70 hover:text-white hover:border-[#D4AF37]/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, idx) => {
            const isSaved = isInWishlist(product.id);
            const isCompared = isInCompare(product.id);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="group glass-card rounded-2xl p-5 border border-white/10 hover:border-[#D4AF37]/50 relative flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges & Heart Wishlist */}
                  <div className="flex items-center justify-between mb-4 z-10 relative">
                    {product.badge ? (
                      <span className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 rounded-full text-[10px] font-bold tracking-widest uppercase">
                        {product.badge}
                      </span>
                    ) : (
                      <span />
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleCompare(product)}
                        className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                          isCompared
                            ? 'bg-[#D4AF37] text-black'
                            : 'bg-black/40 text-white/70 hover:text-white border border-white/10'
                        }`}
                        title="Compare Formula"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                          isSaved
                            ? 'bg-[#D4AF37] text-black'
                            : 'bg-black/40 text-white/70 hover:text-white border border-white/10'
                        }`}
                        title="Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Product Image Frame */}
                  <div className="h-64 w-full relative rounded-xl overflow-hidden mb-5 bg-black/40 border border-white/10">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-108 transition-transform duration-700"
                    />

                    {/* Quick Preview Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                      <button
                        onClick={() => setQuickViewProduct(product)}
                        className="btn-luxury-outline py-2 px-4 text-[11px] flex items-center space-x-1.5 bg-black/80"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>3D Preview</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#D4AF37] font-medium mt-0.5">{product.subtitle}</p>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mt-2 text-xs">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <span className="font-bold text-white/90">{product.rating}</span>
                    <span className="text-white/40">({product.reviewCount})</span>
                  </div>

                  <p className="text-xs text-white/60 line-clamp-2 mt-3 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Price & Add to Cart Footer */}
                <div className="pt-5 mt-5 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="block font-serif text-xl font-bold text-white">
                      {formatPrice(product.price)}
                    </span>
                    <span className="block text-[10px] text-white/40">{product.volume}</span>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="btn-luxury py-2.5 px-4 text-[11px] flex items-center space-x-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
