'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { staggerContainer, fadeInUp } from '@/styles/animations';
import { FEATURES } from '@/lib/constants';

const icons: Record<string, React.ReactNode> = {
  camera: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="24" height="18" rx="3" />
      <circle cx="16" cy="17" r="5" />
      <path d="M11 8l1.5-3h7L21 8" />
    </svg>
  ),
  sparkles: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" />
      <path d="M25 6l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
    </svg>
  ),
  sliders: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="10" x2="26" y2="10" />
      <line x1="6" y1="16" x2="26" y2="16" />
      <line x1="6" y1="22" x2="26" y2="22" />
      <circle cx="12" cy="10" r="2" fill="currentColor" />
      <circle cx="20" cy="16" r="2" fill="currentColor" />
      <circle cx="14" cy="22" r="2" fill="currentColor" />
    </svg>
  ),
};

export default function FeatureShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="max-w-6xl mx-auto py-24 px-6">
      <h2 className="font-display text-heading text-center mb-16">
        How It Works
      </h2>

      <motion.div
        ref={ref}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {FEATURES.map((feature) => (
          <motion.div
            key={feature.step}
            className="glass p-8"
            variants={fadeInUp}
          >
            <p className="text-gold-500 text-sm font-medium tracking-wider uppercase mb-4">
              Step {feature.step}
            </p>
            <div className="text-gold-400 mb-4">
              {icons[feature.icon]}
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">
              {feature.title}
            </h3>
            <p className="text-muted text-sm">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
