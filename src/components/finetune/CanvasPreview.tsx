'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/styles/animations';
import { useAppStore } from '@/stores/appStore';
import BeforeAfterToggle from './BeforeAfterToggle';

export default function CanvasPreview() {
  const selectedStyle = useAppStore((s) => s.selectedStyle);
  const uploadedImage = useAppStore((s) => s.uploadedImage);
  const aiImageUrl = useAppStore((s) => s.aiImageUrl);
  const aiGenerationStatus = useAppStore((s) => s.aiGenerationStatus);
  const aiGenerationMessage = useAppStore((s) => s.aiGenerationMessage);
  const aiError = useAppStore((s) => s.aiError);
  const setAiGenerationStatus = useAppStore((s) => s.setAiGenerationStatus);
  const [comparing, setComparing] = useState(false);

  if (!selectedStyle) return null;

  const showOriginal = comparing || aiGenerationStatus !== 'succeeded';
  const displayImage = showOriginal ? uploadedImage : aiImageUrl;

  return (
    <motion.div
      className="flex-1 flex items-center justify-center relative"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      <div className="rounded-3xl overflow-hidden relative aspect-[3/4] max-h-[70vh] mx-auto w-full max-w-lg border border-black/[0.06]">
        {displayImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayImage}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: selectedStyle.gradient }}
          />
        )}

        {/* Loading overlay */}
        {aiGenerationStatus === 'generating' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white text-sm font-medium px-6 text-center">
              {aiGenerationMessage || 'Generating your look...'}
            </p>
          </div>
        )}

        {/* Error overlay */}
        {aiGenerationStatus === 'failed' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4 px-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p className="text-white text-sm text-center">{aiError || 'Generation failed'}</p>
            <button
              type="button"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-full transition-colors"
              onClick={() => setAiGenerationStatus('idle')}
            >
              Retry
            </button>
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Style name badge */}
        <div className="absolute bottom-6 left-6">
          <p className="text-lg font-semibold text-white drop-shadow">{selectedStyle.nameZh}</p>
          <p className="text-sm text-white/70 drop-shadow">{selectedStyle.name}</p>
        </div>

        {aiGenerationStatus === 'succeeded' && (
          <BeforeAfterToggle
            onCompareStart={() => setComparing(true)}
            onCompareEnd={() => setComparing(false)}
          />
        )}
      </div>
    </motion.div>
  );
}
