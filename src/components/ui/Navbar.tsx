'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  User, 
  Sun, 
  Moon, 
  Menu, 
  ChevronRight,
  ChevronDown,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const ANNOUNCEMENTS = [
  'Spend ₹2499+ & Get 2 Free Neoplex Minis │ Shop Now',
  'Spend ₹4999+ & Get 4 Free Neoplex Minis │ Shop Now',
  'Don’t Miss Out! Limited Time — Enjoy Upto 10% OFF │ Shop Now'
];

export const Navbar: React.FC = () => {
  const {
    cartCount,
    wishlist,
    compareList,
    theme,
    toggleTheme,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsCompareOpen,
    setIsSearchOpen,
    setIsMegaMenuOpen
  } = useStore();

  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full sticky top-0 z-50 bg-white dark:bg-[#0B0A0E] text-black dark:text-white border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-[#111115] text-[#D4AF37] text-xs font-semibold py-2 px-4 text-center overflow-hidden border-b border-[#D4AF37]/20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={announcementIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-2 tracking-wide"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
            <span>{ANNOUNCEMENTS[announcementIndex]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Desktop & Mobile Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Mobile Menu Trigger & Main Links */}
        <div className="flex items-center space-x-8">
          <button
            onClick={() => setIsMegaMenuOpen(true)}
            className="md:hidden p-2 text-gray-800 dark:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          <nav className="hidden md:flex items-center space-x-7 text-xs font-bold uppercase tracking-widest">
            <Link href="/" className="hover:text-[#0F6856] dark:hover:text-[#D4AF37] transition-colors">
              Home
            </Link>
            
            <div
              className="relative"
              onMouseEnter={() => setIsShopDropdownOpen(true)}
              onMouseLeave={() => setIsShopDropdownOpen(false)}
            >
              <Link
                href="/shop"
                className="flex items-center space-x-1 hover:text-[#0F6856] dark:hover:text-[#D4AF37] transition-colors py-2"
              >
                <span>Shop</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </Link>

              <AnimatePresence>
                {isShopDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-0 w-64 bg-white dark:bg-[#14131A] shadow-2xl rounded-xl border border-gray-100 dark:border-white/10 py-3 z-50 text-xs uppercase font-semibold"
                  >
                    {[
                      { name: 'Neoplex Series', href: '/shop?category=neoplex' },
                      { name: 'Neoplastia Series', href: '/shop?category=neoplastia' },
                      { name: 'Hair Botox Series', href: '/shop?category=botox' },
                      { name: 'Brazilian Keratin', href: '/shop?category=keratin' },
                      { name: 'Marula Oil Series', href: '/shop?category=marula' },
                      { name: 'Anti-Dandruff Scalp', href: '/shop?category=ampoule' },
                      { name: 'Damage Repair Series', href: '/shop?category=damage' },
                      { name: 'Styling Series', href: '/shop?category=styling' },
                    ].map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#D4AF37]/15 text-gray-800 dark:text-gray-200 hover:text-[#0F6856] dark:hover:text-[#D4AF37] transition-colors"
                      >
                        <span>{item.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/shop" className="hover:text-[#0F6856] dark:hover:text-[#D4AF37] transition-colors">
              Collections
            </Link>
            <Link href="/about" className="hover:text-[#0F6856] dark:hover:text-[#D4AF37] transition-colors">
              About Us
            </Link>
            <Link href="/professional" className="hover:text-[#0F6856] dark:hover:text-[#D4AF37] font-semibold text-[#D4AF37] transition-colors">
              Salon B2B
            </Link>
            <Link href="/faq" className="hover:text-[#0F6856] dark:hover:text-[#D4AF37] transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="hover:text-[#0F6856] dark:hover:text-[#D4AF37] transition-colors">
              Contact
            </Link>
          </nav>
        </div>

        {/* Center Brand Monogram Logo */}
        <Link href="/" className="flex flex-col items-center group">
          <span className="font-serif text-2xl md:text-3xl font-extrabold tracking-[0.2em] text-black dark:text-white group-hover:text-[#0F6856] dark:group-hover:text-[#D4AF37] transition-colors uppercase">
            CABELO CHAVE
          </span>
          <span className="text-[9px] tracking-[0.45em] text-[#0F6856] dark:text-[#D4AF37] font-sans font-bold -mt-1">
            PROFESSIONAL
          </span>
        </Link>

        {/* Right Utility Icons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            title="Toggle Light / Dark Mode"
            suppressHydrationWarning
          >
            {isMounted && theme === 'dark' ? <Sun className="w-5 h-5 text-[#D4AF37]" /> : <Moon className="w-5 h-5 text-gray-800" />}
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#0F6856] dark:hover:text-[#D4AF37] transition-colors"
            title="Search Products"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsCompareOpen(true)}
            className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#0F6856] dark:hover:text-[#D4AF37] transition-colors relative hidden sm:block"
            title="Compare Formulas"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {isMounted && compareList.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-[#D4AF37] text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                {compareList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsWishlistOpen(true)}
            className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#0F6856] dark:hover:text-[#D4AF37] transition-colors relative hidden sm:block"
            title="Wishlist Vault"
          >
            <Heart className="w-5 h-5" />
            {isMounted && wishlist.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-[#0F6856] dark:bg-[#D4AF37] text-white dark:text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center space-x-2 bg-[#111115] text-[#D4AF37] px-4 py-2 rounded-full font-bold text-xs shadow-md hover:bg-black transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag</span>
            {isMounted && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#D4AF37] text-black text-[10px] font-extrabold rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
