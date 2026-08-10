'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Search, ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_DATA = [
  {
    category: 'Treatments & Formulations',
    items: [
      {
        q: 'Is Cabelo Chave Neoplastia 100% Formaldehyde-Free?',
        a: 'Yes, absolutely. Our Neoplastia Organic Realignment system is engineered using Swiss amino acid nano-technology. It contains zero formaldehyde, zero glutaraldehyde, and produces no toxic fumes during heat sealing.'
      },
      {
        q: 'How long does the Neoplastia / Keratin treatment result last?',
        a: 'When maintained with Cabelo Chave sulfate-free post-care shampoos and conditioners, professional treatment results last up to 12 - 16 weeks (3 to 4 months).'
      },
      {
        q: 'Can Neoplastia or Botox treatments be performed on color-treated or bleached hair?',
        a: 'Yes. In fact, our Neoplex and Silver Series formulas are specifically engineered with violet micro-pigments and bio-polymers to protect blonde tones and strengthen bleached cortex bonds.'
      }
    ]
  },
  {
    category: 'Home Care & Daily Maintenance',
    items: [
      {
        q: 'Should I wash my hair before or after using the Leave-in Spray Conditioner?',
        a: 'Apply the Moisture Kick or Hair Fall Control Leave-In Spray to damp, towel-dried hair after washing with shampoo and conditioner. Do not rinse out.'
      },
      {
        q: 'How often should I use the Damage Repair Mask?',
        a: 'For severely processed or brittle hair, use the Damage Repair Mask 1 - 2 times per week in place of your regular conditioner. Leave on for 5 - 10 minutes before rinsing.'
      }
    ]
  },
  {
    category: 'Orders, Shipping & Salon Support',
    items: [
      {
        q: 'How fast is salon atelier shipping?',
        a: 'All orders are dispatched within 24 hours. We offer Express Delivery across India (1-3 days) and Global Priority Shipping (3-5 days).'
      },
      {
        q: 'How do I register my salon for wholesale pricing?',
        a: 'Salon owners and licensed master stylists can apply via our Professional B2B Portal to unlock wholesale trade discounts and complimentary tester kits.'
      }
    ]
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIdx, setExpandedIdx] = useState<string | null>('0-0');

  const toggleAccordion = (id: string) => {
    setExpandedIdx(expandedIdx === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />

      <main className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
            Client & Professional Knowledge Base
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold gold-gradient-text">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto">
            Everything you need to know about Cabelo Chave Swiss formulations, organic realignment, post-care regimens, and salon partner shipping.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-xl mx-auto">
          <Search className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQs (e.g. Neoplastia, Formaldehyde, Shipping...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/15 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* FAQ Categories */}
        <div className="space-y-10">
          {FAQ_DATA.map((cat, catIdx) => {
            const itemsToRender = cat.items.filter(
              (item) =>
                !searchQuery ||
                item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.a.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (itemsToRender.length === 0) return null;

            return (
              <div key={catIdx} className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#D4AF37] border-b border-white/10 pb-2 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>{cat.category}</span>
                </h3>

                <div className="space-y-3">
                  {itemsToRender.map((item, itemIdx) => {
                    const id = `${catIdx}-${itemIdx}`;
                    const isOpen = expandedIdx === id;

                    return (
                      <div key={itemIdx} className="rounded-xl glass-card border border-white/10 overflow-hidden">
                        <button
                          onClick={() => toggleAccordion(id)}
                          className="w-full p-5 text-left flex items-center justify-between font-serif font-bold text-sm text-white hover:text-[#D4AF37] transition-colors"
                        >
                          <span className="pr-4">{item.q}</span>
                          <ChevronDown className={`w-4 h-4 text-[#D4AF37] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="px-5 pb-5 text-xs text-white/70 leading-relaxed border-t border-white/5 pt-3 bg-white/[0.02]"
                            >
                              {item.a}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
