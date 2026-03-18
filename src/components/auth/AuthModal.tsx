'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';
import { createClient } from '@/lib/supabase/client';

type AuthTab = 'login' | 'register';

const supabase = createClient();

export default function AuthModal() {
  const authModalOpen = useAppStore((s) => s.authModalOpen);
  const pendingAction = useAppStore((s) => s.pendingAction);
  const closeAuthModal = useAppStore((s) => s.closeAuthModal);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const router = useRouter();

  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      if (data.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email! });
        const action = pendingAction;
        closeAuthModal();

        // Execute pending action after login
        if (action === 'history') {
          router.push('/history');
        }
        // 'save' action: the FineTunePanel watches currentUser and
        // pendingAction via useEffect to trigger save automatically
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [tab, email, password, pendingAction, setCurrentUser, closeAuthModal, router]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
  };

  if (!authModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={closeAuthModal}
        />

        {/* Modal */}
        <motion.div
          className="relative glass p-8 w-full max-w-md mx-4 rounded-3xl shadow-xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-fg-muted hover:text-fg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Tabs */}
          <div className="flex gap-1 bg-black/[0.04] rounded-full p-1 mb-6">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); resetForm(); }}
                className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
                  tab === t
                    ? 'bg-white text-fg shadow-sm'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                {t === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fg-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-black/[0.08] bg-white/60
                           placeholder:text-fg-muted/50 text-fg focus:outline-none
                           focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-secondary mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-black/[0.08] bg-white/60
                           placeholder:text-fg-muted/50 text-fg focus:outline-none
                           focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {tab === 'login' ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                tab === 'login' ? 'Log In' : 'Create Account'
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
