'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Sparkles, Tag } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartTotal,
    appliedCoupon,
    discountAmount,
    freeGift,
    applyCoupon,
    removeCoupon,
    formatPrice,
    showToast
  } = useStore();

  const [promoCode, setPromoCode] = useState('');

  if (!isCartOpen) return null;

  const freeShippingThreshold = 30; // $30 USD (equivalent to ~₹2,520 INR)
  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const handleApply = () => {
    if (!promoCode.trim()) return;
    const ok = applyCoupon(promoCode);
    if (ok) setPromoCode('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Drawer Panel */}
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
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-xl font-bold tracking-wider uppercase">Your Shopping Bag</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping & Gift Meter */}
          <div className="px-6 py-4 bg-[#141219] border-b border-white/5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/70">
                {cartSubtotal >= freeShippingThreshold
                  ? '🎉 Free Express Salon Delivery Unlocked!'
                  : `Add ${formatPrice(freeShippingThreshold - cartSubtotal)} more for Free Delivery & Minis`}
              </span>
              <span className="font-semibold text-[#D4AF37]">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FFF3C4] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <ShoppingBag className="w-12 h-12 text-[#D4AF37]/40 mx-auto stroke-1" />
                <p className="font-serif text-lg text-white/70">Your shopping bag is empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="btn-luxury-outline text-xs inline-block"
                >
                  Explore Hair Collection
                </button>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="p-4 rounded-xl glass-card flex space-x-4 items-center relative group"
                >
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden shrink-0 bg-black/40 border border-white/10">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-sm truncate text-white">{product.name}</h3>
                    <p className="text-[11px] text-[#D4AF37] mt-0.5">{product.volume}</p>
                    <p className="font-semibold text-xs text-white/90 mt-1">{formatPrice(product.price)}</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3 mt-3">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-6 h-6 rounded border border-white/20 flex items-center justify-center text-xs hover:border-[#D4AF37]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold w-4 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-6 h-6 rounded border border-white/20 flex items-center justify-center text-xs hover:border-[#D4AF37]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-white/40 hover:text-red-400 p-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Promo Code & Footer Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#121017] space-y-4">
              {/* Promo Code Input & Applied Badges */}
              {appliedCoupon ? (
                <div className="p-3 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-[#D4AF37]" />
                    <div>
                      <span className="font-bold text-white uppercase">{appliedCoupon}</span>
                      {freeGift && <p className="text-[10px] text-[#D4AF37]">{freeGift}</p>}
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-white/50 hover:text-white text-[11px] underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-white/40" />
                      <input
                        type="text"
                        placeholder="Coupon (e.g. ARGANCOMBO, GOLD20)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                        className="w-full bg-black/40 border border-white/15 rounded-lg pl-9 pr-3 py-2 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <button
                      onClick={handleApply}
                      className="px-4 py-2 bg-[#D4AF37] text-black font-extrabold rounded-lg text-xs hover:brightness-110 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="flex space-x-1.5 overflow-x-auto text-[10px]">
                    {['ARGANCOMBO', 'GOLD20', 'NEOPLEX10'].map((c) => (
                      <button
                        key={c}
                        onClick={() => applyCoupon(c)}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs text-white/70">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">{formatPrice(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#D4AF37]">
                    <span>Promo Coupon Savings</span>
                    <span className="font-mono">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Salon Delivery</span>
                  <span className="text-emerald-400">
                    {cartSubtotal >= freeShippingThreshold ? 'FREE' : formatPrice(1.5)}
                  </span>
                </div>
                <div className="flex justify-between font-serif text-base font-bold text-white pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="gold-gradient-text">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="btn-luxury w-full flex items-center justify-center space-x-2 text-xs font-bold py-3.5"
              >
                <span>Proceed to Express Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
