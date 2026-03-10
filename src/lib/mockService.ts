import { MOCK_STYLES } from './mockData';
import type { MakeupStyle } from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface ProgressCallback {
  (stage: number, message: string): void;
}

export async function generateMakeupStyles(
  _imageFile: File,
  onProgress?: ProgressCallback
): Promise<MakeupStyle[]> {
  const stages = [
    { delay: 800, message: 'Analyzing facial features...' },
    { delay: 1000, message: 'Mapping skin tone and texture...' },
    { delay: 1200, message: 'Generating personalized looks...' },
    { delay: 800, message: 'Applying final touches...' },
  ];

  for (let i = 0; i < stages.length; i++) {
    onProgress?.(i + 1, stages[i].message);
    await delay(stages[i].delay);
  }

  return MOCK_STYLES;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function detectFace(_imageUrl: string): Promise<{
  detected: boolean;
  confidence: number;
}> {
  await delay(1500);
  return { detected: true, confidence: 0.98 };
}
