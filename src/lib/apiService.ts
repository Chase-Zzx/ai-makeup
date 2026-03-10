import { buildPrompt } from './promptBuilder';
import type { MakeupStyle, MakeupParams } from '@/types';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function generateAllStyles(options: {
  imageFile: File;
  onProgress?: (message: string) => void;
}): Promise<MakeupStyle[]> {
  const { imageFile, onProgress } = options;

  onProgress?.('Preparing your image...');
  const imageBase64 = await fileToBase64(imageFile);

  onProgress?.('AI is generating 8 personalized looks...');
  const response = await fetch('/api/generate-styles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  onProgress?.('Finishing up...');
  const data = await response.json();
  return data.styles as MakeupStyle[];
}

export async function generateMakeupImage(options: {
  imageFile: File;
  style: MakeupStyle;
  params: MakeupParams;
  customPrompt?: string;
  onProgress?: (message: string) => void;
}): Promise<{ imageUrl: string }> {
  const { imageFile, style, params, customPrompt, onProgress } = options;

  onProgress?.('Preparing image...');
  const imageBase64 = await fileToBase64(imageFile);

  onProgress?.('Building makeup instructions...');
  const prompt = customPrompt?.trim() || buildPrompt(style, params);

  onProgress?.('Sending to AI model...');
  const response = await fetch('/api/generate-makeup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, prompt }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  onProgress?.('AI is generating your look...');
  const data = await response.json();
  return { imageUrl: data.imageUrl };
}
