'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';

export default function FacePreview() {
  const { uploadedImage, faceDetected, setFaceDetected, setUploadedImage, setStep } = useAppStore();
  const [scanning, setScanning] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(400);

  useEffect(() => {
    if (containerRef.current) setH(containerRef.current.offsetHeight);
  }, [uploadedImage]);

  useEffect(() => {
    const t = setTimeout(() => { setScanning(false); setFaceDetected(true); }, 2000);
    return () => clearTimeout(t);
  }, [setFaceDetected]);

  if (!uploadedImage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      className="flex flex-col gap-4"
    >
      <div ref={containerRef} className="relative rounded-3xl overflow-hidden border border-black/[0.06] shadow-lg shadow-black/[0.04]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={uploadedImage} alt="Selfie" className="w-full object-cover" style={{ maxHeight: 480 }} />

        {/* Scanning line animation */}
        <AnimatePresence>
          {scanning && (
            <>
              <motion.div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent"
                initial={{ y: 0 }}
                animate={{ y: [0, h, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Scanning overlay glow */}
              <motion.div
                className="absolute inset-0 bg-accent/[0.03]"
                animate={{ opacity: [0, 0.06, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {/* Scanning text */}
              <motion.div
                className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-black/[0.06]"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-accent"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-xs font-medium text-fg-secondary">Scanning face...</span>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Detection result badge */}
        <AnimatePresence>
          {faceDetected && !scanning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-black/[0.06] shadow-md"
            >
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-green-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs font-semibold text-fg-secondary">Face detected — 98% confidence</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={() => { setUploadedImage(null, null); setFaceDetected(false); }}
          className="btn-secondary flex-1 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>
        <motion.button
          onClick={() => setStep('generate')}
          disabled={!faceDetected}
          className="btn-primary flex-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed shimmer-btn"
          whileHover={faceDetected ? { scale: 1.02 } : {}}
          whileTap={faceDetected ? { scale: 0.98 } : {}}
        >
          <span className="relative z-10">Continue</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
