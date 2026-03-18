'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '@/styles/animations';
import { useAppStore } from '@/stores/appStore';
import { generateAllStyles } from '@/lib/apiService';

import HeroSection from '@/components/landing/HeroSection';
import StickyShowcase from '@/components/landing/StickyShowcase';
import BottomCTA from '@/components/landing/BottomCTA';
import StepIndicator from '@/components/ui/StepIndicator';
import DropZone from '@/components/upload/DropZone';
import FacePreview from '@/components/upload/FacePreview';
import GeneratingLoader from '@/components/generate/GeneratingLoader';
import StyleGrid from '@/components/generate/StyleGrid';
import CanvasPreview from '@/components/finetune/CanvasPreview';
import FineTunePanel from '@/components/finetune/FineTunePanel';

function AuthRequiredDetector() {
  const searchParams = useSearchParams();
  const openAuthModal = useAppStore((s) => s.openAuthModal);

  useEffect(() => {
    if (searchParams.get('authRequired') === 'true') {
      openAuthModal('history');
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams, openAuthModal]);

  return null;
}

function LandingStep() {
  return (
    <div key="landing">
      <HeroSection />
      <StickyShowcase />
      <BottomCTA />
    </div>
  );
}

function UploadStep() {
  const uploadedImage = useAppStore((s) => s.uploadedImage);
  const setStep = useAppStore((s) => s.setStep);
  const setUploadedImage = useAppStore((s) => s.setUploadedImage);
  const setFaceDetected = useAppStore((s) => s.setFaceDetected);

  const handleBack = () => {
    setUploadedImage(null, null);
    setFaceDetected(false);
    setStep('landing');
  };

  return (
    <motion.div key="upload" {...pageTransition} className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <button onClick={handleBack} className="text-fg-muted hover:text-fg transition-colors flex items-center gap-2 text-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <StepIndicator />
        <div className="w-16" />
      </header>

      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-lg">
          <h2 className="text-2xl font-semibold text-center mb-8 tracking-[-0.02em]">
            Upload Your Selfie
          </h2>
          <AnimatePresence mode="wait">
            {!uploadedImage ? (
              <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <DropZone />
              </motion.div>
            ) : (
              <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <FacePreview />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function GenerateStep() {
  const setStep = useAppStore((s) => s.setStep);
  const uploadedFile = useAppStore((s) => s.uploadedFile);
  const isGenerating = useAppStore((s) => s.isGenerating);
  const generatedStyles = useAppStore((s) => s.generatedStyles);
  const setGenerating = useAppStore((s) => s.setGenerating);
  const setGenerationProgress = useAppStore((s) => s.setGenerationProgress);
  const setGeneratedStyles = useAppStore((s) => s.setGeneratedStyles);
  const [error, setError] = useState<string | null>(null);
  const isRunningRef = useRef(false);

  const runGeneration = useCallback(async () => {
    if (!uploadedFile || generatedStyles.length > 0 || isRunningRef.current) return;
    isRunningRef.current = true;

    setError(null);
    setGenerating(true);
    setGenerationProgress({ stage: 1, message: 'Preparing your image...' });

    try {
      const styles = await generateAllStyles({
        imageFile: uploadedFile,
        onProgress: (message) => {
          setGenerationProgress({ stage: 2, message });
        },
      });
      setGeneratedStyles(styles);
    } catch (err) {
      console.error('Style generation failed:', err);
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setGenerating(false);
      setGenerationProgress(null);
      isRunningRef.current = false;
    }
  }, [uploadedFile, generatedStyles.length, setGenerating, setGenerationProgress, setGeneratedStyles]);

  useEffect(() => {
    runGeneration();
  }, [runGeneration]);

  const handleRetry = () => {
    setGeneratedStyles([]);
    setError(null);
  };

  const handleBack = () => {
    setStep('upload');
    setGeneratedStyles([]);
    setGenerating(false);
    setGenerationProgress(null);
  };

  return (
    <motion.div key="generate" {...pageTransition} className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <button onClick={handleBack} className="text-fg-muted hover:text-fg transition-colors flex items-center gap-2 text-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <StepIndicator />
        <div className="w-16" />
      </header>

      <div className="flex-1 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <GeneratingLoader key="loader" />
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center min-h-[60vh]"
              >
                <div className="flex flex-col items-center gap-6 max-w-md text-center">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-fg mb-2">Generation Failed</h3>
                    <p className="text-sm text-fg-muted leading-relaxed">{error}</p>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-full hover:bg-accent/90 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            ) : generatedStyles.length > 0 ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <StyleGrid />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function FinetuneStep() {
  const setStep = useAppStore((s) => s.setStep);
  const selectedStyle = useAppStore((s) => s.selectedStyle);

  const handleBack = () => {
    setStep('generate');
  };

  if (!selectedStyle) return null;

  return (
    <motion.div key="finetune" {...pageTransition} className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <button onClick={handleBack} className="text-fg-muted hover:text-fg transition-colors flex items-center gap-2 text-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <StepIndicator />
        <div className="w-16" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-6 pb-6 overflow-hidden">
        <CanvasPreview />
        <FineTunePanel />
      </div>
    </motion.div>
  );
}

export default function Home() {
  const currentStep = useAppStore((s) => s.currentStep);

  return (
    <main className="min-h-screen">
      <Suspense fallback={null}>
        <AuthRequiredDetector />
      </Suspense>
      <AnimatePresence mode="wait">
        {currentStep === 'landing' && <LandingStep />}
        {currentStep === 'upload' && <UploadStep />}
        {currentStep === 'generate' && <GenerateStep />}
        {currentStep === 'finetune' && <FinetuneStep />}
      </AnimatePresence>
    </main>
  );
}
