'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Heart, User, MessageCircle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { wishlist, setIsWishlistOpen, setIsCartOpen, cartCount } = useStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      {/* Floating WhatsApp Salon Button */}
      <a
        href="https://wa.me/919999999999?text=Hello%20Cabelo%20Chave%20Professional,%20I%20have%20a%20salon%20inquiry"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
        title="Chat with Cabelo Chave Salon Concierge"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
      </a>

      {/* Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0E0E12] border-t border-gray-200 dark:border-white/10 px-4 py-2 flex items-center justify-around text-gray-700 dark:text-gray-300 shadow-2xl">
        <Link
          href="/"
          className={`flex flex-col items-center space-y-1 text-[10px] font-semibold uppercase ${
            pathname === '/' ? 'text-[#0F6856] dark:text-[#D4AF37]' : 'hover:text-black dark:hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          href="/shop"
          className={`flex flex-col items-center space-y-1 text-[10px] font-semibold uppercase ${
            pathname === '/shop' ? 'text-[#0F6856] dark:text-[#D4AF37]' : 'hover:text-black dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Shopping</span>
        </Link>

        <button
          onClick={() => setIsWishlistOpen(true)}
          className="flex flex-col items-center space-y-1 text-[10px] font-semibold uppercase relative hover:text-black dark:hover:text-white"
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {isMounted && wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#0F6856] dark:bg-[#D4AF37] text-white dark:text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </div>
          <span>Wishlist</span>
        </button>

        <Link
          href="/admin"
          className={`flex flex-col items-center space-y-1 text-[10px] font-semibold uppercase ${
            pathname === '/admin' ? 'text-[#0F6856] dark:text-[#D4AF37]' : 'hover:text-black dark:hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Account</span>
        </Link>
      </div>
    </>
  );
};
