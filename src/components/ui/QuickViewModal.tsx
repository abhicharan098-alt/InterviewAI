import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Heart, ShoppingBag, SlidersHorizontal, Zap, Plus, Minus } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const QuickViewModal: React.FC = () => {
  const router = useRouter();
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    formatPrice
  } = useStore();

  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const isSaved = isInWishlist(quickViewProduct.id);
  const isCompared = isInCompare(quickViewProduct.id);

  const handleBuyNow = () => {
    addToCart(quickViewProduct, quantity);
    setQuickViewProduct(null);
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setQuickViewProduct(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl glass-card rounded-2xl p-6 md:p-8 z-10 bg-[#0C0B10] border border-[#D4AF37]/30 shadow-2xl text-white my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Column: High-Definition Product Image */}
            <div className="relative rounded-xl overflow-hidden bg-black/60 border border-white/10 h-[380px] w-full flex items-center justify-center">
              <Image
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Right Column: Product Specs & CTAs */}
            <div className="space-y-4">
              {quickViewProduct.badge && (
                <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase rounded-full">
                  {quickViewProduct.badge}
                </span>
              )}

              <h2 className="font-serif text-2xl md:text-3xl font-bold gold-gradient-text">
                {quickViewProduct.name}
              </h2>
              <p className="text-xs text-[#D4AF37] font-medium">{quickViewProduct.subtitle}</p>

              {/* Rating */}
              <div className="flex items-center space-x-2 text-xs">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-white">{quickViewProduct.rating}</span>
                <span className="text-white/50">({quickViewProduct.reviewCount} salon reviews)</span>
              </div>

              <div className="font-serif text-2xl font-bold text-white">
                {quickViewProduct.priceFormatted || formatPrice(quickViewProduct.price)}
                <span className="text-xs font-sans text-white/50 font-normal ml-2">
                  ({quickViewProduct.volume})
                </span>
              </div>

              <p className="text-xs text-white/70 leading-relaxed">{quickViewProduct.description}</p>

              {/* Quantity Counter */}
              <div className="flex items-center space-x-3 pt-2">
                <span className="text-xs uppercase font-bold text-white/60">Quantity:</span>
                <div className="flex items-center space-x-2 border border-white/20 rounded-lg p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 font-bold text-xs">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct, quantity);
                      setQuickViewProduct(null);
                    }}
                    className="btn-luxury w-full py-3 text-xs flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 hover:brightness-110 shadow-lg transition-all"
                  >
                    <Zap className="w-4 h-4 fill-current text-amber-300" />
                    <span>Buy Now</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => toggleWishlist(quickViewProduct.id)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition-colors ${
                      isSaved
                        ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                        : 'border-white/20 text-white/80 hover:border-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'In Vault' : 'Save to Vault'}</span>
                  </button>

                  <button
                    onClick={() => toggleCompare(quickViewProduct)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition-colors ${
                      isCompared
                        ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                        : 'border-white/20 text-white/80 hover:border-white'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{isCompared ? 'Comparing' : 'Compare Formula'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
