'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';

const MESSAGES = [
  'Preparing your image...',
  'Analyzing facial features...',
  'AI is generating 8 personalized looks...',
  'Crafting your perfect styles...',
  'Adding final touches...',
];

export default function GeneratingLoader() {
  const progress = useAppStore((s) => s.generationProgress);
  const apiMessage = progress?.message;
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const displayMessage = apiMessage || MESSAGES[msgIndex];

  return (
    <motion.div
      className="flex items-center justify-center min-h-[60vh]"
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Animated rings */}
        <div className="relative w-24 h-24">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-accent/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-accent/10"
            animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.05, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0%, #b8908f 30%, transparent 60%)',
              mask: 'radial-gradient(circle, transparent 58%, black 60%, black 66%, transparent 68%)',
              WebkitMask: 'radial-gradient(circle, transparent 58%, black 60%, black 66%, transparent 68%)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b8908f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Message with smooth transitions */}
        <div className="h-8 flex items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={displayMessage}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              className="text-fg-secondary text-sm font-medium text-center"
            >
              {displayMessage}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Indeterminate shimmer bar */}
        <div className="w-56 h-1.5 rounded-full bg-black/[0.04] overflow-hidden">
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent"
            animate={{ x: ['-100%', '300%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <p className="text-[11px] text-fg-muted">
          This may take 30–60 seconds
        </p>
      </div>
    </motion.div>
  );
}
