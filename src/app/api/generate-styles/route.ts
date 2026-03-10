import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export const maxDuration = 300;

const IDENTITY_SUFFIX =
  'Strictly preserve the same identity and facial features of the person in the input photo. Keep the look photorealistic with realistic skin texture. Do not alter face shape, hairstyle, expression, pose, background, or lighting direction.';

const STYLE_DEFINITIONS = [
  {
    id: 'natural-glow',
    name: 'Natural Glow',
    nameZh: '自然光泽',
    description: 'A soft, dewy look that enhances your natural beauty with a luminous finish',
    category: 'natural' as const,
    gradient: 'linear-gradient(135deg, #F5CBA7, #F0B27A, #E8A87C)',
    accentColor: '#F0B27A',
    tags: ['Daily', 'Minimal', 'Dewy'],
    prompt: `Apply natural dewy makeup to the person in the input photo. Soft nude lip color, minimal eye shadow, light rosy blush, luminous dewy skin finish. Fresh and natural look. ${IDENTITY_SUFFIX}`,
    defaultParams: {
      lipColor: '#D4877A',
      lipIntensity: 30,
      eyeShadowColor: '#C4A882',
      eyeShadowIntensity: 20,
      blushLevel: 35,
      contourLevel: 20,
      overallIntensity: 40,
    },
  },
  {
    id: 'smoky-evening',
    name: 'Smoky Evening',
    nameZh: '烟熏晚妆',
    description: 'Dramatic smoky eyes with deep tones perfect for evening events',
    category: 'glam' as const,
    gradient: 'linear-gradient(135deg, #2C2C54, #474787, #706FD3)',
    accentColor: '#706FD3',
    tags: ['Evening', 'Dramatic', 'Smoky'],
    prompt: `Apply dramatic smoky evening makeup to the person in the input photo. Deep berry lips, intense dark smoky eye shadow blended outward, subtle blush, strong facial contour. Glamorous evening look. ${IDENTITY_SUFFIX}`,
    defaultParams: {
      lipColor: '#8B4557',
      lipIntensity: 60,
      eyeShadowColor: '#2C2C54',
      eyeShadowIntensity: 80,
      blushLevel: 30,
      contourLevel: 65,
      overallIntensity: 70,
    },
  },
  {
    id: 'soft-glam',
    name: 'Soft Glam',
    nameZh: '柔光魅力',
    description: 'Warm golden tones with a perfect balance of elegance and approachability',
    category: 'glam' as const,
    gradient: 'linear-gradient(135deg, #D4A843, #C19A3E, #B8860B)',
    accentColor: '#D4A843',
    tags: ['Warm', 'Golden', 'Elegant'],
    prompt: `Apply soft glam makeup to the person in the input photo. Warm red-toned lips, golden eye shadow with shimmer, warm blush, balanced contour and highlight. Elegant and approachable. ${IDENTITY_SUFFIX}`,
    defaultParams: {
      lipColor: '#C44040',
      lipIntensity: 55,
      eyeShadowColor: '#B8860B',
      eyeShadowIntensity: 55,
      blushLevel: 45,
      contourLevel: 50,
      overallIntensity: 60,
    },
  },
  {
    id: 'editorial-bold',
    name: 'Editorial Bold',
    nameZh: '大胆前卫',
    description: 'A striking editorial look with bold colors and sharp definition',
    category: 'editorial' as const,
    gradient: 'linear-gradient(135deg, #C0392B, #E74C3C, #FF6B6B)',
    accentColor: '#E74C3C',
    tags: ['Bold', 'Creative', 'Statement'],
    prompt: `Apply bold editorial high-fashion makeup to the person in the input photo. Striking deep red lips, intense dark dramatic eye shadow, sharp contour and sculpted cheekbones. Bold creative statement look. ${IDENTITY_SUFFIX}`,
    defaultParams: {
      lipColor: '#C0392B',
      lipIntensity: 90,
      eyeShadowColor: '#1A1A2E',
      eyeShadowIntensity: 85,
      blushLevel: 40,
      contourLevel: 75,
      overallIntensity: 85,
    },
  },
  {
    id: 'romantic-rose',
    name: 'Romantic Rose',
    nameZh: '浪漫玫瑰',
    description: 'Soft pinks and rose tones for a dreamy, romantic aesthetic',
    category: 'romantic' as const,
    gradient: 'linear-gradient(135deg, #F8B4C8, #E8A0B4, #D4878A)',
    accentColor: '#E8A0B4',
    tags: ['Romantic', 'Pink', 'Soft'],
    prompt: `Apply romantic rose makeup to the person in the input photo. Soft pink rose lips, rosy pink eye shadow, prominent pink blush on cheeks, soft contour. Dreamy romantic aesthetic. ${IDENTITY_SUFFIX}`,
    defaultParams: {
      lipColor: '#D4878A',
      lipIntensity: 50,
      eyeShadowColor: '#E8A0B4',
      eyeShadowIntensity: 40,
      blushLevel: 60,
      contourLevel: 30,
      overallIntensity: 50,
    },
  },
  {
    id: 'sun-kissed',
    name: 'Sun-Kissed Bronze',
    nameZh: '阳光古铜',
    description: 'A warm, bronzed look that captures the essence of golden hour',
    category: 'fresh' as const,
    gradient: 'linear-gradient(135deg, #CD853F, #D4A06A, #DAA520)',
    accentColor: '#CD853F',
    tags: ['Bronze', 'Warm', 'Summer'],
    prompt: `Apply sun-kissed bronzed makeup to the person in the input photo. Warm bronze lip color, golden-bronze eye shadow, warm sun-kissed blush, strong bronzer contour. Summer golden-hour glow. ${IDENTITY_SUFFIX}`,
    defaultParams: {
      lipColor: '#B87333',
      lipIntensity: 40,
      eyeShadowColor: '#CD853F',
      eyeShadowIntensity: 45,
      blushLevel: 55,
      contourLevel: 60,
      overallIntensity: 55,
    },
  },
  {
    id: 'classic-red',
    name: 'Classic Red Lip',
    nameZh: '经典红唇',
    description: 'Timeless elegance with a bold red lip and refined eye definition',
    category: 'classic' as const,
    gradient: 'linear-gradient(135deg, #8B0000, #C41E3A, #DC143C)',
    accentColor: '#C41E3A',
    tags: ['Classic', 'Red Lip', 'Timeless'],
    prompt: `Apply classic red lip makeup to the person in the input photo. Bold vivid red lipstick, subtle brown eye shadow with thin eyeliner, light natural blush, gentle contour. Timeless elegant look. ${IDENTITY_SUFFIX}`,
    defaultParams: {
      lipColor: '#C41E3A',
      lipIntensity: 85,
      eyeShadowColor: '#3C1414',
      eyeShadowIntensity: 35,
      blushLevel: 35,
      contourLevel: 45,
      overallIntensity: 65,
    },
  },
  {
    id: 'dewy-fresh',
    name: 'Dewy Fresh',
    nameZh: '清透水光',
    description: 'Ultra-fresh, glass-skin effect with barely-there makeup',
    category: 'fresh' as const,
    gradient: 'linear-gradient(135deg, #A8E6CF, #88D8B0, #7EC8A0)',
    accentColor: '#88D8B0',
    tags: ['Fresh', 'Glass Skin', 'Minimal'],
    prompt: `Apply ultra-fresh dewy glass-skin makeup to the person in the input photo. Barely-there lip tint in soft pink, almost no eye shadow, very light blush, no contour. Glass skin effect with luminous hydrated glow. ${IDENTITY_SUFFIX}`,
    defaultParams: {
      lipColor: '#E0A0A0',
      lipIntensity: 20,
      eyeShadowColor: '#C4B896',
      eyeShadowIntensity: 15,
      blushLevel: 25,
      contourLevel: 15,
      overallIntensity: 30,
    },
  },
];

function extractImageUrl(output: unknown): string | null {
  if (Array.isArray(output) && output.length > 0) {
    const item = output[0];
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
      if (typeof (item as { url: () => string }).url === 'function') {
        return (item as { url: () => string }).url();
      }
      if ('url' in item) return String((item as { url: string }).url);
    }
    return String(item);
  }
  if (typeof output === 'string') return output;
  if (output && typeof output === 'object' && 'url' in output) {
    return String((output as { url: string }).url);
  }
  return null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request) {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    return NextResponse.json(
      { error: 'REPLICATE_API_TOKEN is not configured' },
      { status: 500 }
    );
  }

  let body: { imageBase64: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { imageBase64 } = body;
  if (!imageBase64) {
    return NextResponse.json(
      { error: 'Missing required field: imageBase64' },
      { status: 400 }
    );
  }

  const replicate = new Replicate({ auth: apiToken });

  async function generateOne(style: (typeof STYLE_DEFINITIONS)[number]) {
    const output = await replicate.run('bytedance/seedream-4', {
      input: {
        prompt: style.prompt,
        image_input: [imageBase64],
      },
    });

    const imageUrl = extractImageUrl(output);
    if (!imageUrl) {
      throw new Error(`No image URL in output for style ${style.id}`);
    }

    return {
      id: style.id,
      name: style.name,
      nameZh: style.nameZh,
      description: style.description,
      category: style.category,
      gradient: style.gradient,
      accentColor: style.accentColor,
      tags: style.tags,
      defaultParams: style.defaultParams,
      imageUrl,
    };
  }

  const MAX_RETRIES = 2;
  const COOLDOWN_BETWEEN_REQUESTS_MS = 3000;

  async function generateWithRetry(style: (typeof STYLE_DEFINITIONS)[number]) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await generateOne(style);
      } catch (err) {
        const errStr = String(err);
        const is429 = errStr.includes('429');

        if (attempt < MAX_RETRIES && is429) {
          const retryMatch = errStr.match(/resets in ~(\d+)s/);
          const waitSec = retryMatch ? parseInt(retryMatch[1], 10) + 3 : 15;
          console.log(`Rate limited on ${style.id} (attempt ${attempt + 1}), waiting ${waitSec}s...`);
          await sleep(waitSec * 1000);
          continue;
        }

        throw err;
      }
    }
    throw new Error('Unreachable');
  }

  const styles: Awaited<ReturnType<typeof generateOne>>[] = [];
  const errors: string[] = [];

  for (let i = 0; i < STYLE_DEFINITIONS.length; i++) {
    const styleDef = STYLE_DEFINITIONS[i];

    // Cooldown between requests to stay under rate limit
    if (i > 0) {
      await sleep(COOLDOWN_BETWEEN_REQUESTS_MS);
    }

    try {
      const result = await generateWithRetry(styleDef);
      styles.push(result);
    } catch (err) {
      console.error(`Failed ${styleDef.id} after retries:`, err);
      errors.push(`${styleDef.id}: ${String(err)}`);
    }
  }

  if (errors.length > 0) {
    console.error('Some style generations failed:', errors);
  }

  if (styles.length === 0) {
    return NextResponse.json(
      { error: 'All style generations failed. Please try again.', details: errors },
      { status: 500 }
    );
  }

  return NextResponse.json({ styles, failedCount: errors.length });
}
