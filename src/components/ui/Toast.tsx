'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useStore();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-8 right-8 z-[120] glass-card px-5 py-3.5 rounded-full border border-[#D4AF37]/50 shadow-2xl flex items-center space-x-3 bg-[#0D0B12]/90 text-white"
        >
          <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
          </div>
          <span className="text-xs font-semibold tracking-wide">{toastMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
