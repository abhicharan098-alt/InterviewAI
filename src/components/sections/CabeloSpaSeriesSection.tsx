'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingBag, Heart, Eye } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { useStore } from '@/context/StoreContext';

const SPA_TABS = [
  { id: 'all', label: 'All Spa Products' },
  { id: 'damage', label: 'Damage Repair' },
  { id: 'marula', label: 'Marula Oil' },
  { id: 'keratin', label: 'Argan & Keratin' },
  { id: 'ampoule', label: 'Scalp Detox' }
];

export const CabeloSpaSeriesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useStore();

  const productsToDisplay = activeTab === 'all'
    ? PRODUCTS.slice(2, 10)
    : PRODUCTS.filter((p) => p.category === activeTab).slice(0, 8);

  return (
    <section className="py-20 bg-white dark:bg-[#07070A] text-black dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold tracking-[0.25em] text-[#0F6856] dark:text-[#D4AF37] uppercase">
            Sensory Botanical Care
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold">
            Where Self-Care Meets Haircare Your Spa Series Awaits
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Immerse your strands in restorative natural botanicals, lipophilic lipids, and weightless hydration.
          </p>
        </div>

        {/* Tabs with ALL Spa Products */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 border-b border-gray-200 dark:border-white/10 pb-4">
          {SPA_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[#111115] text-[#D4AF37] shadow-lg scale-105 ring-1 ring-[#D4AF37]/50'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {productsToDisplay.map((product) => {
            const isSaved = isInWishlist(product.id);

            return (
              <div
                key={product.id}
                className="group bg-gray-50 dark:bg-[#0E0E14] border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 bg-[#0F6856]/10 dark:bg-[#D4AF37]/20 text-[#0F6856] dark:text-[#D4AF37] rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {product.badge || 'Spa Series'}
                    </span>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                        isSaved ? 'bg-[#D4AF37] text-black' : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="h-60 w-full relative rounded-xl overflow-hidden mb-4 bg-white dark:bg-black/40 border border-gray-100 dark:border-white/5">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => setQuickViewProduct(product)}
                        className="bg-black/90 text-white font-bold text-xs py-2 px-4 rounded-full flex items-center space-x-1.5 hover:bg-black"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Quick View</span>
                      </button>
                    </div>
                  </div>

                  <Link href={`/product/${product.id}`} className="group-hover:text-[#0F6856] dark:group-hover:text-[#D4AF37] transition-colors">
                    <h3 className="font-serif text-base font-bold line-clamp-1">{product.name}</h3>
                  </Link>

                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-bold">{product.rating}</span>
                    <span className="text-[11px] text-gray-500">({product.reviewCount})</span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-serif text-lg font-bold text-[#0F6856] dark:text-[#D4AF37]">
                      {product.priceFormatted}
                    </span>
                    <span className="block text-[10px] text-gray-500">{product.volume}</span>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="bg-[#111115] hover:bg-black text-[#D4AF37] font-bold py-2 px-3.5 rounded-full text-xs flex items-center space-x-1.5 transition-colors shadow"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
