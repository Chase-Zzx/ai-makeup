'use client';

import { useCallback, useEffect, useState } from 'react';
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
  const currentUser = useAppStore((s) => s.currentUser);
  const openAuthModal = useAppStore((s) => s.openAuthModal);
  const fromHistory = useAppStore((s) => s.fromHistory);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [pendingSave, setPendingSave] = useState(false);

  const doSave = useCallback(async () => {
    // Read fresh state from store to avoid stale closures after auth
    const { currentUser: user, uploadedFile: file, aiImageUrl: imageUrl, selectedStyle: style, makeupParams: params } = useAppStore.getState();
    if (!imageUrl || !style || !file || !user) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const generationId = crypto.randomUUID();

      // Convert original file to base64 for server-side upload
      const originalPath = `${user.id}/${generationId}-original.jpg`;
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      const origRes = await fetch('/api/download-and-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data, storagePath: originalPath, contentType: file.type }),
      });
      if (!origRes.ok) {
        const err = await origRes.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(`Original upload failed: ${err.error}`);
      }

      // Upload generated image via server relay
      const generatedPath = `${user.id}/${generationId}-result.jpg`;
      const relayRes = await fetch('/api/download-and-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: imageUrl, storagePath: generatedPath }),
      });
      if (!relayRes.ok) {
        const err = await relayRes.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error);
      }

      // Save DB record
      const saveRes = await fetch('/api/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: generationId,
          originalImagePath: originalPath,
          generatedImagePath: generatedPath,
          styleName: style.name,
          makeupParams: params,
        }),
      });
      if (!saveRes.ok) {
        const err = await saveRes.json().catch(() => ({ error: 'Save failed' }));
        throw new Error(err.error);
      }

      setSaveMessage('Saved!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : 'Save failed');
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
      setPendingSave(false);
    }
  }, []);

  // Watch for auth completion when save was pending
  useEffect(() => {
    if (pendingSave && currentUser) {
      doSave();
    }
  }, [pendingSave, currentUser, doSave]);

  const handleSaveClick = useCallback(() => {
    if (!currentUser) {
      setPendingSave(true);
      openAuthModal('save');
    } else {
      doSave();
    }
  }, [currentUser, openAuthModal, doSave]);

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
            disabled={isRegenerating || fromHistory}
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
        {/* Save to account */}
        {aiImageUrl && !fromHistory && (
          <button
            type="button"
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            onClick={handleSaveClick}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : saveMessage ? (
              saveMessage
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save to Account
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
