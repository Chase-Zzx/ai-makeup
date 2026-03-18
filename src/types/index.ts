export interface MakeupParams {
  lipColor: string;
  lipIntensity: number;
  eyeShadowColor: string;
  eyeShadowIntensity: number;
  blushLevel: number;
  contourLevel: number;
  overallIntensity: number;
}

export interface MakeupStyle {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  category: 'natural' | 'glam' | 'editorial' | 'classic' | 'romantic' | 'fresh';
  gradient: string;
  accentColor: string;
  tags: string[];
  defaultParams: MakeupParams;
  imageUrl?: string;
}

export interface FaceDetectionResult {
  detected: boolean;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence?: number;
}

export interface UploadState {
  file: File | null;
  preview: string | null;
  isProcessing: boolean;
  error: string | null;
}

export type WizardStep = 'landing' | 'upload' | 'generate' | 'finetune';

export interface GenerationProgress {
  stage: number;
  totalStages: number;
  message: string;
}

export interface GenerationHistoryRecord {
  id: string;
  user_id: string;
  original_image_path: string;
  generated_image_path: string;
  style_name: string;
  makeup_params: MakeupParams;
  created_at: string;
  is_favorite?: boolean;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  history_id: string;
  created_at: string;
}

export type PendingAction = 'save' | 'history' | null;
