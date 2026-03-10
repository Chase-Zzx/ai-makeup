'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useAppStore } from '@/stores/appStore';

export default function BottomCTA() {
  const setStep = useAppStore((s) => s.setStep);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-32 px-6 relative overflow-hidden">
      {/* Animated mesh background */}
      <div className="absolute inset-0 mesh-bg" />

      {/* Dot grid */}
      <motion.div
        className="absolute inset-0 dot-grid"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Multiple animated accent blobs */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.5 }}
      >
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-accent/[0.08] blur-[120px]"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-[#d4b5b4]/[0.06] blur-[80px]"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-[#956b6a]/[0.05] blur-[70px]"
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </motion.div>

      {/* Decorative ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-accent/[0.06] pointer-events-none"
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-accent/[0.04] pointer-events-none"
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="max-w-2xl mx-auto text-center relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <motion.h2
          className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] mb-5"
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
        >
          Ready to find{' '}
          <span className="text-gradient-animated">your look</span>?
        </motion.h2>
        <motion.p
          className="text-fg-secondary text-lg mb-12"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Free, fast, and surprisingly accurate.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.button
            className="btn-primary shimmer-btn text-[15px] px-12 py-4 group"
            onClick={() => setStep('upload')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Get started
              <motion.svg
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </motion.svg>
            </span>
          </motion.button>
        </motion.div>
        <motion.p
          className="text-fg-muted text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
        >
          No sign-up · No watermark · Your photos stay private
        </motion.p>
      </motion.div>
    </section>
  );
}
