'use client';

import { motion } from 'framer-motion';

const cosmetics = [
  {
    name: 'lipstick',
    top: '12%',
    left: '8%',
    opacity: 0.2,
    duration: 5,
    svg: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="17" y="20" width="14" height="22" rx="2" />
        <path d="M19 20V14c0-1 1.5-6 5-6s5 5 5 6v6" />
        <line x1="17" y1="28" x2="31" y2="28" />
      </svg>
    ),
  },
  {
    name: 'brush',
    top: '25%',
    right: '10%',
    opacity: 0.18,
    duration: 6,
    svg: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 4c-3 8-8 14-8 20a8 8 0 0016 0c0-6-5-12-8-20z" />
        <line x1="24" y1="32" x2="24" y2="44" />
        <line x1="20" y1="44" x2="28" y2="44" />
      </svg>
    ),
  },
  {
    name: 'palette',
    bottom: '20%',
    left: '12%',
    opacity: 0.25,
    duration: 7,
    svg: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="14" width="40" height="28" rx="4" />
        <circle cx="20" cy="28" r="4" />
        <circle cx="32" cy="24" r="3" />
        <circle cx="36" cy="32" r="3" />
      </svg>
    ),
  },
  {
    name: 'mascara',
    top: '60%',
    right: '6%',
    opacity: 0.15,
    duration: 5.5,
    svg: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="18" y="4" width="8" height="28" rx="3" />
        <path d="M16 32h12" />
        <path d="M19 36h6" />
        <line x1="22" y1="32" x2="22" y2="40" />
      </svg>
    ),
  },
  {
    name: 'mirror',
    bottom: '30%',
    right: '18%',
    opacity: 0.22,
    duration: 8,
    svg: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="20" r="14" />
        <circle cx="24" cy="20" r="10" />
        <line x1="24" y1="34" x2="24" y2="44" />
        <line x1="18" y1="44" x2="30" y2="44" />
      </svg>
    ),
  },
];

export default function FloatingCosmetics() {
  return (
    <div className="absolute inset-0 z-0 hidden md:block pointer-events-none">
      {cosmetics.map((item) => (
        <motion.div
          key={item.name}
          className="absolute text-gold-500"
          style={{
            top: item.top,
            left: (item as { left?: string }).left,
            right: (item as { right?: string }).right,
            bottom: (item as { bottom?: string }).bottom,
            opacity: item.opacity,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.svg}
        </motion.div>
      ))}
    </div>
  );
}
