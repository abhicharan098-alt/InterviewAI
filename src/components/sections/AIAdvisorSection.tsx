'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight, RotateCcw, ShoppingBag, X } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { PRODUCTS } from '@/data/products';
import { Product } from '@/types';

export const AIAdvisorSection: React.FC = () => {
  const { isAIAdvisorOpen, setIsAIAdvisorOpen, addToCart, formatPrice, showToast } = useStore();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    texture: '',
    damage: '',
    scalp: '',
    goal: ''
  });

  const [recommendedBundle, setRecommendedBundle] = useState<Product[] | null>(null);

  const stepsQuestions = [
    {
      title: 'What is your natural hair texture & pattern?',
      subtitle: 'Determines the lipophilic molecular weight required.',
      key: 'texture',
      options: [
        { label: 'Fine & Straight', value: 'fine' },
        { label: 'Medium Density', value: 'medium' },
        { label: 'Coarse & Thick', value: 'coarse' },
        { label: 'Wavy & Coily', value: 'curly' }
      ]
    },
    {
      title: 'What is your current hair damage level?',
      subtitle: 'Determines peptide cortex bond reconstruction depth.',
      key: 'damage',
      options: [
        { label: 'Natural / Minimal Damage', value: 'virgin' },
        { label: 'Mild Blow Dryer & Heat Styling', value: 'mild' },
        { label: 'Severe Breakage & Split Ends', value: 'severe' },
        { label: 'Bleached / Double Processed Color', value: 'bleached' }
      ]
    },
    {
      title: 'How would you describe your scalp state?',
      subtitle: 'Determines botanical prebiotic concentrate needed.',
      key: 'scalp',
      options: [
        { label: 'Balanced / Normal', value: 'normal' },
        { label: 'Oily & Congested Roots', value: 'oily' },
        { label: 'Dry & Flaky Tightness', value: 'dry' },
        { label: 'Sensitive / Redness Prone', value: 'sensitive' }
      ]
    },
    {
      title: 'What is your #1 primary hair goal?',
      subtitle: 'Final luxury finishing touch formulation.',
      key: 'goal',
      options: [
        { label: 'High Gloss Mirror Shine', value: 'shine' },
        { label: 'Complete Cortex Bond Repair', value: 'repair' },
        { label: 'Scalp Detox & Hair Density', value: 'density' },
        { label: 'Anti-Humidity Frizz Shield', value: 'frizz' }
      ]
    }
  ];

  const handleSelect = (key: string, value: string) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);

    if (step < stepsQuestions.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate Curated Regimen Bundle
      let bundle: Product[] = [];
      if (updated.damage === 'bleached' || updated.damage === 'severe') {
        bundle = [PRODUCTS[0], PRODUCTS[2]]; // Elixir 24K + Bond Repair Mask
      } else if (updated.scalp === 'oily' || updated.goal === 'density') {
        bundle = [PRODUCTS[1], PRODUCTS[3]]; // Keratin Shampoo + Scalp Detox
      } else {
        bundle = [PRODUCTS[0], PRODUCTS[4]]; // Elixir 24K + Silk Finishing Serum
      }
      setRecommendedBundle(bundle);
      setStep(4);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({ texture: '', damage: '', scalp: '', goal: '' });
    setRecommendedBundle(null);
  };

  const handleAddBundle = () => {
    if (recommendedBundle) {
      recommendedBundle.forEach((p) => addToCart(p));
      showToast('Prescription Regimen Bundle added to Cart!');
      if (isAIAdvisorOpen) setIsAIAdvisorOpen(false);
    }
  };

  const content = (
    <div className="max-w-4xl mx-auto w-full glass-card rounded-3xl p-8 md:p-12 border border-[#D4AF37]/40 bg-[#0C0B11] text-white relative shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold gold-gradient-text uppercase">
              AI Salon Hair Diagnostic
            </h3>
            <p className="text-xs text-white/50">Personalized Zurich Trichology Prescription</p>
          </div>
        </div>

        {isAIAdvisorOpen && (
          <button
            onClick={() => setIsAIAdvisorOpen(false)}
            className="p-2 text-white/50 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {step < 4 ? (
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs text-[#D4AF37] font-mono">
            <span>Step {step + 1} of 4</span>
            <span>{Math.round(((step + 1) / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D4AF37] transition-all duration-300"
              style={{ width: `${((step + 1) / 4) * 100}%` }}
            />
          </div>

          <h4 className="font-serif text-2xl font-bold text-white pt-2">
            {stepsQuestions[step].title}
          </h4>
          <p className="text-xs text-white/60">{stepsQuestions[step].subtitle}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {stepsQuestions[step].options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(stepsQuestions[step].key, opt.value)}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-left transition-all group flex items-center justify-between"
              >
                <span className="font-semibold text-sm group-hover:text-[#D4AF37]">
                  {opt.label}
                </span>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Results Screen */
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>AI Diagnostic Complete &bull; 99.4% Match Accuracy</span>
          </div>

          <h4 className="font-serif text-3xl font-bold gold-gradient-text">
            Your Bespoke Regimen Prescription
          </h4>
          <p className="text-xs text-white/70">
            Based on your responses, our Zurich trichology engine prescribes this 2-step synergistic regimen to rebuild broken cortex bonds and seal light reflection.
          </p>

          {/* Recommended Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {recommendedBundle?.map((product) => (
              <div
                key={product.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-4"
              >
                <div className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div>
                  <h5 className="font-serif font-bold text-sm text-white">{product.name}</h5>
                  <p className="text-[11px] text-[#D4AF37]">{product.subtitle}</p>
                  <span className="font-mono text-xs font-bold text-white mt-1 block">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              onClick={handleAddBundle}
              className="btn-luxury w-full sm:flex-1 py-3 text-xs flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Complete Prescribed Regimen to Bag</span>
            </button>

            <button
              onClick={handleReset}
              className="btn-luxury-outline py-3 px-6 text-xs flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Render modal if triggered from header, or section if on homepage
  if (isAIAdvisorOpen) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAIAdvisorOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full"
          >
            {content}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <section id="ai-advisor" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {content}
    </section>
  );
};
