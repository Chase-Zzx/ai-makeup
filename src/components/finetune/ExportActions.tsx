'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/styles/animations';

interface ExportActionsProps {
  onDownload?: () => void;
}

export default function ExportActions({ onDownload }: ExportActionsProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My AI Makeup Look',
          text: 'Check out my look!',
        });
      } catch {
        // User cancelled or share failed silently
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <motion.div
      className="flex gap-3"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.button
        type="button"
        className="btn-primary flex items-center gap-2"
        variants={fadeInUp}
        onClick={onDownload}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download
      </motion.button>
      <motion.button
        type="button"
        className="btn-secondary flex items-center gap-2"
        variants={fadeInUp}
        onClick={handleShare}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </motion.button>
    </motion.div>
  );
}
