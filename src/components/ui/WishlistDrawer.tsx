'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { PRODUCTS } from '@/data/products';

export const WishlistDrawer: React.FC = () => {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, toggleWishlist, addToCart, formatPrice } = useStore();

  if (!isWishlistOpen) return null;

  const wishlistProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsWishlistOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md bg-[#0C0B0E] border-l border-[#D4AF37]/20 text-white h-full flex flex-col z-10 shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
              <h2 className="font-serif text-xl font-bold tracking-wider uppercase">Saved Vault ({wishlist.length})</h2>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlistProducts.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <Heart className="w-12 h-12 text-[#D4AF37]/40 mx-auto stroke-1" />
                <p className="font-serif text-lg text-white/70">Your luxury wishlist vault is empty.</p>
              </div>
            ) : (
              wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-4 rounded-xl glass-card flex space-x-4 items-center relative group"
                >
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden shrink-0 bg-black/40 border border-white/10">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-sm truncate text-white">{product.name}</h3>
                    <p className="text-[11px] text-[#D4AF37] mt-0.5">{product.subtitle}</p>
                    <p className="font-semibold text-xs text-white/90 mt-1">{formatPrice(product.price)}</p>

                    <button
                      onClick={() => addToCart(product)}
                      className="mt-2 text-[11px] font-semibold text-[#D4AF37] hover:underline flex items-center space-x-1"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Move to Bag</span>
                    </button>
                  </div>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="text-white/40 hover:text-red-400 p-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
