'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Zap } from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://cabelochave.com/cdn/shop/files/Neoplex_Banner.jpg_freebe_024f0847-c7cc-42f9-bebf-e177649cac69_2048x.jpg?v=1773741498',
    primaryHref: '/shop?category=neoplex',
    btnColor: '#247c20',
    primaryCta: 'Shop Now',
    mobileImage: 'https://cabelochave.com/cdn/shop/files/Neoplex_Mob_Banner.jpg_freebe_74b7b8b7-50c7-4050-8c1a-b1a104edb68a_767x.jpg?v=1773741499'
  },
  {
    id: 2,
    image: 'https://cabelochave.com/cdn/shop/files/Web_Banner_Neoplex_jpg_08c5a0dc-c889-43aa-b84f-07b070d62c30_2048x.jpg?v=1769063139',
    primaryHref: '/shop?category=neoplex',
    btnColor: '#1b3496',
    primaryCta: 'Shop Now',
    mobileImage: 'https://cabelochave.com/cdn/shop/files/Mob_Banner_Neoplex.jpg_1_767x.jpg?v=1769070285'
  },
  {
    id: 3,
    image: 'https://cabelochave.com/cdn/shop/files/Web_Banner_Argan_jpg_2048x.jpg?v=1769063907',
    primaryHref: '/shop?category=argan',
    btnColor: '#1b3496',
    primaryCta: 'Shop Now',
    mobileImage: 'https://cabelochave.com/cdn/shop/files/Mob_Banner_Argan.jpg_1_767x.jpg?v=1769070296'
  },
  {
    id: 4,
    image: 'https://cabelochave.com/cdn/shop/files/Web_Banner_Botox_jpg_2048x.jpg?v=1769065072',
    primaryHref: '/shop?category=botox',
    btnColor: '#1b3496',
    primaryCta: 'Shop Now',
    mobileImage: 'https://cabelochave.com/cdn/shop/files/Mob_Banner_Botox.jpg_1_767x.jpg?v=1769070293'
  },
  {
    id: 5,
    image: 'https://cabelochave.com/cdn/shop/files/Hero_Banner__1920x850_2_42f3530f-7ed8-452b-832d-fe6972eb5a9e_2048x.jpg?v=1744199064',
    primaryHref: '/shop',
    btnColor: '#222222',
    primaryCta: 'Shop Now',
    mobileImage: 'https://cabelochave.com/cdn/shop/files/Hero_Banner_430x450px_Model_767x.jpg?v=1745668400'
  },
  {
    id: 6,
    image: 'https://cabelochave.com/cdn/shop/files/Hero_Banner__1920x850_1_129cd125-b8a5-4be9-be75-e71a8f21062b_2048x.jpg?v=1744446929',
    primaryHref: '/shop?category=neoplastia',
    btnColor: '#000000',
    primaryCta: 'Shop Now',
    mobileImage: 'https://cabelochave.com/cdn/shop/files/Hero_Banner_430x450px_Pro-liss_767x.jpg?v=1745668425'
  },
  {
    id: 7,
    image: 'https://cabelochave.com/cdn/shop/files/Hero_Banner_Neoplex_2048x.jpg?v=1747846621',
    primaryHref: '/shop?category=neoplex',
    btnColor: '#000000',
    primaryCta: 'Shop Now',
    mobileImage: 'https://cabelochave.com/cdn/shop/files/Hero_Banner_430x450px_Neoplex_767x.jpg?v=1745668476'
  },
  {
    id: 8,
    image: 'https://cabelochave.com/cdn/shop/files/Hero_Banner_Botox_2048x.jpg?v=1747846588',
    primaryHref: '/shop?category=botox',
    btnColor: '#000000',
    primaryCta: 'Shop Now',
    mobileImage: 'https://cabelochave.com/cdn/shop/files/Hero_Banner_430x450px_Botox_767x.jpg?v=1745668509'
  },
  {
    id: 9,
    image: 'https://cabelochave.com/cdn/shop/files/1920_x_850_02_BANNER_WEB_a04658f8-21e4-4447-9a0d-48b432128dde_2048x.webp?v=1757684029',
    primaryHref: '/shop?category=styling',
    btnColor: '#ff7b2e',
    primaryCta: 'Shop Now',
    mobileImage: 'https://cabelochave.com/cdn/shop/files/2100_x_2198_02_BANNER_PHONE_e7a95a42-c736-4833-aa3a-8fc6365151f3_767x.jpg?v=1757684056'
  }
];

const PROMO_OFFERS = [
  'Spend ₹2499+ & Get 2 Free Neoplex Minis',
  'Spend ₹4999+ & Get 4 Free Neoplex Minis',
  "Don't Miss Out! Limited Time — Enjoy Upto 10% OFF"
];

export const CabeloHeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPromo, setCurrentPromo] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    const promoTimer = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % PROMO_OFFERS.length);
    }, 3000);
    return () => clearInterval(promoTimer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative w-full bg-black text-white overflow-hidden">
      {/* 🔔 Promo Announcement Bar */}
      <div className="relative z-20 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-[#D4AF37]/20 border-b border-[#D4AF37]/20 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPromo}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2 py-2 px-4 text-[10px] md:text-xs font-bold tracking-wide text-[#E5C158]"
          >
            <Zap className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
            <span>{PROMO_OFFERS[currentPromo]}</span>
            <Link href="/shop" className="underline underline-offset-2 text-white hover:text-[#D4AF37] transition-colors ml-1">
              Shop Now
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Slideshow - using aspect-ratio like reference site */}
      <div className="relative w-full" style={{ paddingBottom: '44.3%' }}>
        <div className="absolute inset-0">
          {/* Background Image Carousel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-0"
            >
              {/* Desktop Image */}
              <div className="hidden md:block relative w-full h-full">
                <Image
                  src={slide.image}
                  alt="Cabelo Chave Banner"
                  fill
                  priority
                  className="object-cover object-center"
                />
              </div>
              {/* Mobile Image */}
              <div className="md:hidden relative w-full h-full">
                <Image
                  src={slide.mobileImage}
                  alt="Cabelo Chave Banner"
                  fill
                  priority
                  className="object-cover object-center"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            </motion.div>
          </AnimatePresence>


          {/* Slide Counter */}
          <div className="absolute bottom-3 left-4 z-20 text-[10px] text-white/50 font-mono">
            {String(currentSlide + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
          </div>

          {/* Slider Nav Controls */}
          <div className="absolute bottom-3 right-4 z-20 flex items-center space-x-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className="p-1.5 rounded-full glass-panel hover:bg-white/30 text-white transition-colors"
              title="Previous Slide"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex space-x-1.5">
              {HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentSlide === idx ? 'w-6 bg-[#D4AF37]' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
              className="p-1.5 rounded-full glass-panel hover:bg-white/30 text-white transition-colors"
              title="Next Slide"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
