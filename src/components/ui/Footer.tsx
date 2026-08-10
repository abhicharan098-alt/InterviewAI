'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B0A0E] text-white pt-16 pb-24 md:pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                CABELO CHAVE
              </span>
              <span className="text-[9px] tracking-[0.4em] text-white/70 font-bold uppercase -mt-1">
                PROFESSIONAL
              </span>
            </Link>
            <h3 className="font-serif text-sm font-bold text-[#D4AF37]">
              Your Ultimate Haircare Destination
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Whether you're styling on-the-go or giving your hair some extra care, these clean beauty essentials are your shortcut to stronger, shinier, healthier hair.
            </p>
          </div>

          {/* Column 2: Know More */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
              Know More
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/professional" className="hover:text-[#D4AF37] font-semibold text-[#D4AF37] transition-colors">Salon B2B Wholesale</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us & Ateliers</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQs & Knowledge Base</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Executive Portal</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
              Custom Service
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/shop" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Return & Refund Policy</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/checkout" className="hover:text-white transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Column 4: Careers & Contact */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
              Careers & Salon Support
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Passionate about working in the hair care industry? Join our team! We're always looking for creative, driven individuals.
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-300">
              <Mail className="w-4 h-4 text-[#D4AF37]" />
              <a href="mailto:hr@cabelochave.com" className="hover:text-[#D4AF37] transition-colors">
                hr@cabelochave.com
              </a>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-300">
              <Phone className="w-4 h-4 text-[#D4AF37]" />
              <span>+91 99999 99999 (Salon Concierge)</span>
            </div>
          </div>
        </div>

        {/* Bottom Social & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex space-x-5 text-gray-300">
            <a href="https://www.facebook.com/p/Cabelo-Chave-61550193366645/" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/cabelochaveprofessional/?hl=en" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://www.youtube.com/@cabelochaveprofessional" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="https://in.linkedin.com/company/cabelo-chave-professional" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>

          <p className="text-center md:text-right text-gray-500">
            Copyright © 2025 Cabelo Chave Professional. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
