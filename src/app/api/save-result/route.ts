import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, originalImagePath, generatedImagePath, styleName, makeupParams } = body;

    if (!id || !originalImagePath || !generatedImagePath || !styleName || !makeupParams) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase.from('generation_history').insert({
      id,
      user_id: user.id,
      original_image_path: originalImagePath,
      generated_image_path: generatedImagePath,
      style_name: styleName,
      makeup_params: makeupParams,
    });

    if (error) {
      console.error('DB insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id });
  } catch (err) {
    console.error('Save result error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
