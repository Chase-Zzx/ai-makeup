'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  glowColor?: 'gold' | 'rose';
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = '',
  hoverable = false,
  glowColor,
  onClick,
}: GlassCardProps) {
  const glowClass = glowColor === 'gold' ? 'hover:glow-gold' : glowColor === 'rose' ? 'hover:glow-rose' : '';

  return (
    <motion.div
      className={`glass p-6 ${hoverable ? 'glass-hover cursor-pointer' : ''} ${glowClass} ${className}`}
      whileHover={{ scale: hoverable ? 1.02 : 1 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
