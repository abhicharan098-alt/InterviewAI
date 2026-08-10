'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { useStore } from '@/context/StoreContext';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

const ATELIERS = [
  {
    city: 'Paris',
    name: 'Atelier de Beauté Paris',
    address: '42 Rue du Faubourg Saint-Honoré, 75008 Paris',
    phone: '+33 1 42 68 55 00',
    hours: 'Mon-Sat: 9:00 AM - 7:00 PM'
  },
  {
    city: 'Tokyo',
    name: 'Maison de Ginza Tokyo',
    address: '6-10-1 Ginza, Chuo-ku, Tokyo 104-0061',
    phone: '+81 3 5537 1100',
    hours: 'Mon-Sun: 10:00 AM - 8:00 PM'
  },
  {
    city: 'Mumbai',
    name: 'Cabelo Chave Flagship Atelier',
    address: 'Bandra West, Hill Road, Mumbai, Maharashtra 400050',
    phone: '+91 22 6123 4567',
    hours: 'Mon-Sun: 10:00 AM - 9:00 PM'
  },
  {
    city: 'London',
    name: 'Luxe Hair Lab Mayfair',
    address: '14 Bond Street, Mayfair, London W1S 3SX',
    phone: '+44 20 7946 0912',
    hours: 'Mon-Sat: 9:30 AM - 7:30 PM'
  }
];

export default function ContactPage() {
  const { showToast } = useStore();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Salon Support', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your message has been sent to Cabelo Chave Concierge.');
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />

      <main className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
            Client & Salon Atelier Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold gold-gradient-text">
            Get in Touch with Cabelo Chave
          </h1>
          <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto">
            Whether you are seeking hair diagnostic guidance, order assistance, or salon atelier partnership support, our team is at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Form */}
          <div className="p-8 rounded-2xl glass-card border border-white/10 bg-[#0C0B12]">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-serif text-2xl font-bold gold-gradient-text">Message Sent</h3>
                <p className="text-xs text-white/70">
                  Thank you, <strong className="text-white">{formData.name}</strong>. A Cabelo Chave Concierge Representative will respond to {formData.email} shortly.
                </p>
                <button onClick={() => setSubmitted(false)} className="btn-luxury-outline py-2 px-6 text-xs mt-4">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-xl font-bold gold-gradient-text mb-4">Send a Message</h3>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-white/70 mb-1">Your Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Sophia Loren"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-white/70 mb-1">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="sophia@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-white/70 mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#0D0C12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Salon Support">Salon Support & Orders</option>
                    <option value="Product Advice">Product & Hair Care Advice</option>
                    <option value="Wholesale Inquiry">Wholesale & Distribution</option>
                    <option value="General">General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-white/70 mb-1">Your Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we assist you today?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <button type="submit" className="btn-luxury w-full py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Transmit Inquiry</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick Contact Info */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
              <h3 className="font-serif text-xl font-bold">Global Headquarters & Support</h3>
              <div className="space-y-3 text-xs text-white/80">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-[#D4AF37]" />
                  <span>support@cabelochave.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-[#D4AF37]" />
                  <span>+91 1800 123 4567 (Toll-Free Salon Helpline)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span>Monday - Saturday: 9:00 AM - 8:00 PM IST</span>
                </div>
              </div>
            </div>

            {/* Atelier Grid preview */}
            <div className="p-6 rounded-2xl bg-[#0F0E16] border border-[#D4AF37]/30 space-y-3">
              <h4 className="font-serif text-sm font-bold text-white flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>Partner Atelier Stockists</span>
              </h4>
              <p className="text-xs text-white/60">
                Cabelo Chave professional treatments are performed in over 1,420 premier salons across France, Japan, Italy, UK, USA, and India.
              </p>
            </div>
          </div>
        </div>

        {/* Global Ateliers Section */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-center gold-gradient-text">Featured Atelier Locations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ATELIERS.map((atelier, idx) => (
              <div key={idx} className="p-6 rounded-2xl glass-card border border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/20 inline-block">
                  {atelier.city}
                </span>
                <h4 className="font-serif text-base font-bold text-white">{atelier.name}</h4>
                <p className="text-xs text-white/60">{atelier.address}</p>
                <p className="text-xs text-[#D4AF37] pt-1">{atelier.phone}</p>
                <p className="text-[10px] text-white/40">{atelier.hours}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
