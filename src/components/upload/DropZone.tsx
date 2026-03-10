'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';

export default function DropZone() {
  const setUploadedImage = useAppStore((s) => s.setUploadedImage);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) { setError('Please upload a JPEG, PNG, or WebP image'); return; }
    if (file.size > MAX_FILE_SIZE) { setError('File size must be under 10 MB'); return; }
    setUploadedImage(URL.createObjectURL(file), file);
  }, [setUploadedImage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      className={`
        relative min-h-[380px] flex flex-col items-center justify-center gap-5
        border-2 border-dashed rounded-3xl p-8 cursor-pointer transition-all duration-500 overflow-hidden
        ${error
          ? 'border-red-300 bg-red-50/50'
          : isDragOver
            ? 'border-accent bg-accent-bg scale-[1.02] shadow-xl shadow-accent/10'
            : 'border-black/[0.1] hover:border-accent/30 bg-white hover:shadow-lg hover:shadow-accent/5'}
      `}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
      whileHover={{ y: -2 }}
    >
      {/* Background glow on drag */}
      {isDragOver && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent/10 blur-[80px]" />
        </motion.div>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

      {/* Upload icon with animation */}
      <motion.div
        className={`transition-transform duration-300 ${isDragOver ? 'scale-125' : ''}`}
        animate={isDragOver ? { y: [0, -12, 0] } : { y: [0, -6, 0] }}
        transition={{ duration: isDragOver ? 0.6 : 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-20 h-20 rounded-2xl bg-accent/[0.06] flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b8908f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
      </motion.div>

      <div className="text-center">
        <p className="text-base font-semibold text-fg">Drop your selfie here</p>
        <p className="text-sm text-fg-muted mt-1.5">or click to browse</p>
      </div>

      <div className="flex items-center gap-4 mt-1">
        {['JPEG', 'PNG', 'WebP'].map((fmt) => (
          <span key={fmt} className="text-[11px] text-fg-muted px-2.5 py-1 rounded-full bg-bg-muted">{fmt}</span>
        ))}
        <span className="text-[11px] text-fg-muted">up to 10 MB</span>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 font-medium"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
