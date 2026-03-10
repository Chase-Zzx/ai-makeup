'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { slideFromRight } from '@/styles/animations';
import { useAppStore } from '@/stores/appStore';
import { LIP_COLORS, EYE_COLORS } from '@/lib/constants';
import { generateMakeupImage } from '@/lib/apiService';
import AdjustmentSlider from './AdjustmentSlider';
import ColorPicker from './ColorPicker';
import ExportActions from './ExportActions';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-black/[0.06] pb-6 mb-6">
      <h3 className="text-sm font-medium text-fg-secondary mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function FineTunePanel() {
  const selectedStyle = useAppStore((s) => s.selectedStyle);
  const makeupParams = useAppStore((s) => s.makeupParams);
  const updateParam = useAppStore((s) => s.updateParam);
  const resetParams = useAppStore((s) => s.resetParams);
  const uploadedFile = useAppStore((s) => s.uploadedFile);
  const aiImageUrl = useAppStore((s) => s.aiImageUrl);
  const aiGenerationStatus = useAppStore((s) => s.aiGenerationStatus);
  const customPrompt = useAppStore((s) => s.customPrompt);
  const setCustomPrompt = useAppStore((s) => s.setCustomPrompt);
  const setAiImageUrl = useAppStore((s) => s.setAiImageUrl);
  const setAiGenerationStatus = useAppStore((s) => s.setAiGenerationStatus);
  const setAiGenerationMessage = useAppStore((s) => s.setAiGenerationMessage);
  const setAiError = useAppStore((s) => s.setAiError);

  const handleRegenerate = useCallback(async () => {
    if (!uploadedFile || !selectedStyle) return;

    setAiGenerationStatus('generating');
    setAiError(null);

    try {
      const result = await generateMakeupImage({
        imageFile: uploadedFile,
        style: selectedStyle,
        params: makeupParams,
        customPrompt: customPrompt || undefined,
        onProgress: (message) => setAiGenerationMessage(message),
      });
      setAiImageUrl(result.imageUrl);
      setAiGenerationStatus('succeeded');
      setAiGenerationMessage(null);
    } catch (error) {
      setAiGenerationStatus('failed');
      setAiError(error instanceof Error ? error.message : 'Generation failed');
      setAiGenerationMessage(null);
    }
  }, [uploadedFile, selectedStyle, makeupParams, customPrompt, setAiImageUrl, setAiGenerationStatus, setAiGenerationMessage, setAiError]);

  const handleDownload = useCallback(async () => {
    if (aiImageUrl) {
      try {
        const response = await fetch(aiImageUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'glow-ai-makeup.png';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } catch {
        window.open(aiImageUrl, '_blank');
      }
      return;
    }

    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'glow-ai-makeup.png';
      link.href = canvas.toDataURL();
      link.click();
    } else {
      const img = document.querySelector<HTMLImageElement>('.preview-image');
      if (img) {
        const link = document.createElement('a');
        link.download = 'glow-ai-makeup.png';
        link.href = img.src;
        link.click();
      }
    }
  }, [aiImageUrl]);

  if (!selectedStyle) return null;

  const isRegenerating = aiGenerationStatus === 'generating';

  return (
    <motion.div
      className="w-full lg:w-96 h-full overflow-y-auto card p-6"
      variants={slideFromRight}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="border-b border-black/[0.06] pb-6 mb-6">
        <p className="text-sm text-accent font-medium mb-1">{selectedStyle.nameZh}</p>
        <h2 className="text-xl font-semibold text-fg">Fine Tune</h2>
      </div>

      {/* Custom Prompt */}
      <Section title="Custom Prompt">
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Describe your desired look, e.g. 'Make the lips a deeper red' or 'Add dramatic smoky eye shadow'..."
          className="w-full h-24 px-3 py-2.5 text-sm rounded-xl border border-black/[0.08] bg-white/60 
                     placeholder:text-fg-muted/50 text-fg resize-none focus:outline-none 
                     focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
        />
        <p className="mt-2 text-[11px] text-fg-muted">
          Leave empty to use the slider settings below
        </p>
      </Section>

      <Section title="Lips">
        <ColorPicker
          colors={LIP_COLORS}
          selectedColor={makeupParams.lipColor}
          onChange={(color) => updateParam('lipColor', color)}
          label="Lip Color"
        />
        <div className="mt-4">
          <AdjustmentSlider
            label="Lip Intensity"
            value={makeupParams.lipIntensity}
            onChange={(v) => updateParam('lipIntensity', v)}
          />
        </div>
      </Section>

      <Section title="Eyes">
        <ColorPicker
          colors={EYE_COLORS}
          selectedColor={makeupParams.eyeShadowColor}
          onChange={(color) => updateParam('eyeShadowColor', color)}
          label="Eye Shadow Color"
        />
        <div className="mt-4">
          <AdjustmentSlider
            label="Eye Shadow Intensity"
            value={makeupParams.eyeShadowIntensity}
            onChange={(v) => updateParam('eyeShadowIntensity', v)}
          />
        </div>
      </Section>

      <Section title="Cheeks">
        <AdjustmentSlider
          label="Blush Level"
          value={makeupParams.blushLevel}
          onChange={(v) => updateParam('blushLevel', v)}
        />
      </Section>

      <Section title="Contour">
        <AdjustmentSlider
          label="Contour Level"
          value={makeupParams.contourLevel}
          onChange={(v) => updateParam('contourLevel', v)}
        />
      </Section>

      <Section title="Overall">
        <AdjustmentSlider
          label="Master Intensity"
          value={makeupParams.overallIntensity}
          onChange={(v) => updateParam('overallIntensity', v)}
        />
      </Section>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-secondary flex-1"
            onClick={() => { resetParams(); setCustomPrompt(''); }}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" />
                </svg>
                Regenerate
              </>
            )}
          </button>
        </div>
        <ExportActions onDownload={handleDownload} />
      </div>
    </motion.div>
  );
}
