'use client';

import { motion } from 'framer-motion';

interface BeforeAfterToggleProps {
  onCompareStart: () => void;
  onCompareEnd: () => void;
}

export default function BeforeAfterToggle({ onCompareStart, onCompareEnd }: BeforeAfterToggleProps) {
  return (
    <motion.div
      className="absolute bottom-4 left-1/2 -translate-x-1/2"
      whileTap={{ scale: 0.95 }}
    >
      <button
        type="button"
        className="bg-white/90 backdrop-blur-sm border border-black/[0.06] shadow-sm px-6 py-2 rounded-full text-sm cursor-pointer flex items-center gap-2 select-none text-fg hover:bg-white transition-colors"
        onMouseDown={onCompareStart}
        onMouseUp={onCompareEnd}
        onMouseLeave={onCompareEnd}
        onTouchStart={onCompareStart}
        onTouchEnd={onCompareEnd}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Hold to Compare
      </button>
    </motion.div>
  );
}
