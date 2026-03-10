import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export const maxDuration = 300;

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

export async function POST(request: Request) {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    return NextResponse.json(
      { error: 'REPLICATE_API_TOKEN is not configured' },
      { status: 500 }
    );
  }

  let body: { imageBase64: string; prompt: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { imageBase64, prompt } = body;

  if (!imageBase64 || !prompt) {
    return NextResponse.json(
      { error: 'Missing required fields: imageBase64, prompt' },
      { status: 400 }
    );
  }

  const replicate = new Replicate({ auth: apiToken });

  try {
    const output = await replicate.run('bytedance/seedream-4', {
      input: {
        prompt,
        image_input: [imageBase64],
      },
    });

    const imageUrl = extractImageUrl(output);

    if (!imageUrl) {
      console.error('Unexpected Replicate output format:', output);
      return NextResponse.json(
        { error: 'Unexpected response format from AI model' },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Replicate API error:', error);
    const message =
      error instanceof Error ? error.message : 'AI generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
