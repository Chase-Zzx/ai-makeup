/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/styles/animations';
import { useAppStore } from '@/stores/appStore';
import { createClient } from '@/lib/supabase/client';
import type { GenerationHistoryRecord, MakeupParams } from '@/types';

// Module-scope singleton — avoids re-creating on every render (which would
// break useCallback dependency arrays and cause infinite re-render loops).
const supabase = createClient();

export default function HistoryPage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const setStep = useAppStore((s) => s.setStep);
  const setFromHistory = useAppStore((s) => s.setFromHistory);
  const updateParam = useAppStore((s) => s.updateParam);
  const selectStyle = useAppStore((s) => s.selectStyle);
  const setAiImageUrl = useAppStore((s) => s.setAiImageUrl);
  const setAiGenerationStatus = useAppStore((s) => s.setAiGenerationStatus);

  const [records, setRecords] = useState<GenerationHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const loadHistory = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);

    const { data: history, error } = await supabase
      .from('generation_history')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load history error:', error);
      setLoading(false);
      return;
    }

    // Get favorites
    const { data: favs } = await supabase
      .from('user_favorites')
      .select('history_id')
      .eq('user_id', currentUser.id);

    const favSet = new Set(favs?.map((f) => f.history_id) ?? []);
    const withFavs = (history ?? []).map((r) => ({
      ...r,
      is_favorite: favSet.has(r.id),
    }));

    setRecords(withFavs);

    // Generate signed URLs for thumbnails
    const paths = withFavs.map((r) => r.generated_image_path);
    if (paths.length > 0) {
      const { data: urls } = await supabase.storage
        .from('makeup-images')
        .createSignedUrls(paths, 3600);

      if (urls) {
        const urlMap: Record<string, string> = {};
        urls.forEach((u) => {
          if (u.signedUrl) urlMap[u.path!] = u.signedUrl;
        });
        setSignedUrls(urlMap);
      }
    }

    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Refresh signed URLs on tab focus
  useEffect(() => {
    const listener = () => {
      if (document.visibilityState === 'visible') loadHistory();
    };
    document.addEventListener('visibilitychange', listener);
    return () => document.removeEventListener('visibilitychange', listener);
  }, [loadHistory]);

  const toggleFavorite = async (record: GenerationHistoryRecord) => {
    if (!currentUser) return;

    if (record.is_favorite) {
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('history_id', record.id);
    } else {
      await supabase
        .from('user_favorites')
        .insert({ user_id: currentUser.id, history_id: record.id });
    }

    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id ? { ...r, is_favorite: !r.is_favorite } : r
      )
    );
  };

  const handleCardClick = async (record: GenerationHistoryRecord) => {
    // Get signed URL for the generated image
    const { data } = await supabase.storage
      .from('makeup-images')
      .createSignedUrl(record.generated_image_path, 3600);

    // Set up store for finetune view
    const params = record.makeup_params as MakeupParams;
    selectStyle({
      id: record.id,
      name: record.style_name,
      nameZh: record.style_name,
      description: '',
      category: 'natural',
      gradient: '',
      accentColor: '',
      tags: [],
      defaultParams: params,
      imageUrl: data?.signedUrl ?? undefined,
    });

    // Apply saved params
    (Object.keys(params) as (keyof MakeupParams)[]).forEach((key) => {
      updateParam(key, params[key]);
    });

    if (data?.signedUrl) {
      setAiImageUrl(data.signedUrl);
      setAiGenerationStatus('succeeded');
    }

    setFromHistory(true);
    setStep('finetune');
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => router.push('/')}
          className="text-fg-muted hover:text-fg transition-colors flex items-center gap-2 text-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-lg font-semibold">History</h1>
        <div className="w-16" />
      </header>

      <div className="px-6 pb-12 max-w-6xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <p className="text-fg-muted text-sm">No saved looks yet.</p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary mt-4"
            >
              Create Your First Look
            </button>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {records.map((record) => (
              <motion.div
                key={record.id}
                variants={fadeInUp}
                className="card overflow-hidden cursor-pointer group"
                onClick={() => handleCardClick(record)}
              >
                <div className="aspect-square bg-bg-muted relative overflow-hidden">
                  {signedUrls[record.generated_image_path] ? (
                    <img
                      src={signedUrls[record.generated_image_path]}
                      alt={record.style_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-fg-muted text-xs">
                      Loading...
                    </div>
                  )}

                  {/* Favorite star */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(record); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm
                               flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <svg
                      width="16" height="16" viewBox="0 0 24 24"
                      fill={record.is_favorite ? '#f59e0b' : 'none'}
                      stroke={record.is_favorite ? '#f59e0b' : 'currentColor'}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                </div>

                <div className="p-3">
                  <p className="text-sm font-medium text-fg truncate">{record.style_name}</p>
                  <p className="text-xs text-fg-muted mt-0.5">
                    {new Date(record.created_at).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
