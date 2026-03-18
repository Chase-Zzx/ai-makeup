'use client';

import { useEffect, type ReactNode } from 'react';
import { useAppStore } from '@/stores/appStore';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/auth/AuthModal';
import UserMenu from '@/components/auth/UserMenu';

function useAuthSync() {
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  useEffect(() => {
    const supabase = createClient();

    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser({ id: user.id, email: user.email! });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setCurrentUser({ id: session.user.id, email: session.user.email! });
        } else {
          setCurrentUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setCurrentUser]);
}

export default function ClientProviders({ children }: { children: ReactNode }) {
  useAuthSync();

  return (
    <>
      {/* Global navbar with UserMenu */}
      <nav className="fixed top-0 right-0 z-50 p-4">
        <UserMenu />
      </nav>

      {children}
      <AuthModal />
    </>
  );
}
