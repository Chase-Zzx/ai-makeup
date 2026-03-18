import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Authenticate the caller
    const userClient = createServerSupabaseClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceUrl, storagePath } = await request.json();
    if (!sourceUrl || !storagePath) {
      return NextResponse.json({ error: 'Missing sourceUrl or storagePath' }, { status: 400 });
    }

    // Verify the storage path starts with user's own folder
    if (!storagePath.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch the image from the source URL
    const imageResponse = await fetch(sourceUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch source image' }, { status: 502 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/png';

    // Upload using service role client (bypasses RLS for storage)
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: uploadError } = await serviceClient.storage
      .from('makeup-images')
      .upload(storagePath, imageBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    return NextResponse.json({ path: storagePath });
  } catch (err) {
    console.error('Download and upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
