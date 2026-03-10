import { LIP_COLORS, EYE_COLORS } from './constants';
import type { MakeupParams, MakeupStyle } from '@/types';

function hexToColorName(hex: string): string {
  const allColors = [...LIP_COLORS, ...EYE_COLORS];
  const match = allColors.find(
    (c) => c.value.toLowerCase() === hex.toLowerCase()
  );
  if (match) return match.name.toLowerCase();

  // Fallback: describe by hue family
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (r > g && r > b) return 'red-toned';
  if (g > r && g > b) return 'green-toned';
  if (b > r && b > g) return 'blue-toned';
  return 'neutral';
}

function intensityToWord(value: number): string {
  if (value <= 30) return 'subtle';
  if (value <= 60) return 'moderate';
  return 'bold';
}

export function buildPrompt(style: MakeupStyle, params: MakeupParams): string {
  const lipColorName = hexToColorName(params.lipColor);
  const eyeColorName = hexToColorName(params.eyeShadowColor);

  const lipDesc = `${intensityToWord(params.lipIntensity)} ${lipColorName} lip color`;
  const eyeDesc = `${intensityToWord(params.eyeShadowIntensity)} ${eyeColorName} eye shadow`;
  const blushDesc = `${intensityToWord(params.blushLevel)} blush`;
  const contourDesc = `${intensityToWord(params.contourLevel)} contour and highlight`;
  const overallDesc = intensityToWord(params.overallIntensity);

  return `Apply ${style.name} makeup to the person in the input photo while strictly preserving the same identity and facial features. Use ${lipDesc}, ${eyeDesc}, ${blushDesc}, and ${contourDesc}. The overall makeup intensity should be ${overallDesc}. Keep the look photorealistic with realistic skin texture. Do not alter face shape, hairstyle, expression, pose, background, or lighting direction.`;
}
