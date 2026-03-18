import { create } from 'zustand';
import type { MakeupParams, MakeupStyle, WizardStep, PendingAction } from '@/types';

const defaultParams: MakeupParams = {
  lipColor: '#C44040',
  lipIntensity: 50,
  eyeShadowColor: '#8B6914',
  eyeShadowIntensity: 50,
  blushLevel: 50,
  contourLevel: 50,
  overallIntensity: 50,
};

interface AppState {
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;

  uploadedImage: string | null;
  uploadedFile: File | null;
  faceDetected: boolean;
  setUploadedImage: (url: string | null, file: File | null) => void;
  setFaceDetected: (detected: boolean) => void;

  isGenerating: boolean;
  generationProgress: { stage: number; message: string } | null;
  generatedStyles: MakeupStyle[];
  setGenerating: (generating: boolean) => void;
  setGenerationProgress: (progress: { stage: number; message: string } | null) => void;
  setGeneratedStyles: (styles: MakeupStyle[]) => void;

  selectedStyle: MakeupStyle | null;
  makeupParams: MakeupParams;
  selectStyle: (style: MakeupStyle) => void;
  updateParam: <K extends keyof MakeupParams>(key: K, value: MakeupParams[K]) => void;
  resetParams: () => void;

  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;

  aiImageUrl: string | null;
  aiGenerationStatus: 'idle' | 'generating' | 'succeeded' | 'failed';
  aiGenerationMessage: string | null;
  aiError: string | null;
  setAiImageUrl: (url: string | null) => void;
  setAiGenerationStatus: (status: 'idle' | 'generating' | 'succeeded' | 'failed') => void;
  setAiGenerationMessage: (message: string | null) => void;
  setAiError: (error: string | null) => void;

  // Auth
  currentUser: { id: string; email: string } | null;
  authModalOpen: boolean;
  pendingAction: PendingAction;
  setCurrentUser: (user: { id: string; email: string } | null) => void;
  setAuthModalOpen: (open: boolean) => void;
  setPendingAction: (action: PendingAction) => void;
  openAuthModal: (action: PendingAction) => void;
  closeAuthModal: () => void;

  // History navigation
  fromHistory: boolean;
  setFromHistory: (val: boolean) => void;

  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentStep: 'landing',
  setStep: (step) => set({ currentStep: step }),

  uploadedImage: null,
  uploadedFile: null,
  faceDetected: false,
  setUploadedImage: (url, file) => set({ uploadedImage: url, uploadedFile: file }),
  setFaceDetected: (detected) => set({ faceDetected: detected }),

  isGenerating: false,
  generationProgress: null,
  generatedStyles: [],
  setGenerating: (generating) => set({ isGenerating: generating }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  setGeneratedStyles: (styles) => set({ generatedStyles: styles }),

  selectedStyle: null,
  makeupParams: defaultParams,
  selectStyle: (style) =>
    set({
      selectedStyle: style,
      makeupParams: style.defaultParams,
      customPrompt: '',
      aiImageUrl: style.imageUrl ?? null,
      aiGenerationStatus: style.imageUrl ? 'succeeded' : 'idle',
      aiGenerationMessage: null,
      aiError: null,
    }),
  updateParam: (key, value) =>
    set((state) => ({
      makeupParams: { ...state.makeupParams, [key]: value },
    })),
  resetParams: () =>
    set((state) => ({
      makeupParams: state.selectedStyle?.defaultParams ?? defaultParams,
    })),

  customPrompt: '',
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),

  aiImageUrl: null,
  aiGenerationStatus: 'idle',
  aiGenerationMessage: null,
  aiError: null,
  setAiImageUrl: (url) => set({ aiImageUrl: url }),
  setAiGenerationStatus: (status) => set({ aiGenerationStatus: status }),
  setAiGenerationMessage: (message) => set({ aiGenerationMessage: message }),
  setAiError: (error) => set({ aiError: error }),

  // Auth
  currentUser: null,
  authModalOpen: false,
  pendingAction: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setPendingAction: (action) => set({ pendingAction: action }),
  openAuthModal: (action) =>
    set({ authModalOpen: true, pendingAction: action }),
  closeAuthModal: () =>
    set({ authModalOpen: false, pendingAction: null }),

  // History navigation
  fromHistory: false,
  setFromHistory: (val) => set({ fromHistory: val }),

  reset: () =>
    set({
      currentStep: 'landing',
      uploadedImage: null,
      uploadedFile: null,
      faceDetected: false,
      isGenerating: false,
      generationProgress: null,
      generatedStyles: [],
      selectedStyle: null,
      makeupParams: defaultParams,
      customPrompt: '',
      aiImageUrl: null,
      aiGenerationStatus: 'idle',
      aiGenerationMessage: null,
      aiError: null,
      authModalOpen: false,
      pendingAction: null,
      fromHistory: false,
    }),
}));
