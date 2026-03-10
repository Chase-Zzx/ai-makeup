'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';
import type { MakeupStyle } from '@/types';

export default function StyleCard({ style, index }: { style: MakeupStyle; index: number }) {
  const { selectStyle, setStep } = useAppStore();
  const [hovered, setHovered] = useState(false);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setRot({
      x: ((e.clientY - r.top) / r.height - 0.5) * -16,
      y: ((e.clientX - r.left) / r.width - 0.5) * 16,
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      className="cursor-pointer group"
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setRot({ x: 0, y: 0 }); setHovered(false); }}
      onClick={() => { selectStyle(style); setStep('finetune'); }}
      style={{
        transform: `perspective(800px) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
        transition: 'transform 0.12s ease-out',
      }}
    >
      <div className={`
        rounded-2xl overflow-hidden bg-white border transition-all duration-500
        ${hovered
          ? 'border-accent/40 shadow-xl shadow-accent/[0.12] -translate-y-1'
          : 'border-black/[0.06] shadow-sm hover:shadow-md'}
      `}>
        <div className="aspect-[3/4] relative overflow-hidden">
          {/* Gradient fallback */}
          <div
            className="absolute inset-0"
            style={{ background: style.gradient }}
          />

          {/* AI-generated image */}
          {style.imageUrl && (
            <motion.img
              src={style.imageUrl}
              alt={style.name}
              className="absolute inset-0 w-full h-full object-cover"
              onLoad={() => setImgLoaded(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: imgLoaded ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Zoom on hover */}
          {style.imageUrl && imgLoaded && (
            <motion.div
              className="absolute inset-0"
              animate={{ scale: hovered ? 1.05 : 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={style.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Shimmer overlay on hover */}
          {hovered && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          )}

          {/* Bottom gradient + name */}
          <div className="absolute inset-x-0 bottom-0 p-4 pt-16 bg-gradient-to-t from-black/50 to-transparent">
            <p className="text-white text-sm font-semibold drop-shadow-md">{style.name}</p>
          </div>

          {/* Hover arrow */}
          <motion.div
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </motion.div>
        </div>

        <div className="p-3.5">
          <span className="tag">{style.category}</span>
          <p className="mt-2 text-xs text-fg-muted line-clamp-2 leading-relaxed">{style.description}</p>
        </div>
      </div>
    </motion.div>
  );
}
