export const APP_NAME = 'GlowAI';
export const APP_TAGLINE = 'Your Perfect Look, Powered by AI';
export const APP_DESCRIPTION =
  'Upload a selfie and discover your ideal makeup looks with AI-powered style generation';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const GENERATION_STAGES_TOTAL = 4;

export const LIP_COLORS = [
  { name: 'Nude', value: '#D4877A' },
  { name: 'Rose', value: '#C44060' },
  { name: 'Berry', value: '#8B4557' },
  { name: 'Red', value: '#C41E3A' },
  { name: 'Coral', value: '#E06050' },
  { name: 'Mauve', value: '#916080' },
];

export const EYE_COLORS = [
  { name: 'Brown', value: '#8B6914' },
  { name: 'Gold', value: '#B8860B' },
  { name: 'Purple', value: '#6B3FA0' },
  { name: 'Green', value: '#4A7C59' },
  { name: 'Navy', value: '#2C3E6B' },
  { name: 'Smoke', value: '#363636' },
];

export const FEATURES = [
  {
    step: 1,
    title: 'Upload',
    titleZh: '上传自拍',
    description: 'Take a selfie or upload your favorite photo',
    descriptionZh: '拍一张自拍或上传你喜欢的照片',
    icon: 'camera',
  },
  {
    step: 2,
    title: 'Generate',
    titleZh: 'AI 生成',
    description: 'Our AI creates 8 unique makeup looks tailored to you',
    descriptionZh: 'AI 为你量身打造 8 种不同风格的妆容',
    icon: 'sparkles',
  },
  {
    step: 3,
    title: 'Perfect',
    titleZh: '精细调整',
    description: 'Fine-tune every detail until it\'s absolutely perfect',
    descriptionZh: '微调每一个细节，直到完美无瑕',
    icon: 'sliders',
  },
];
