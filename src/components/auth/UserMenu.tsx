'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/appStore';
import { createClient } from '@/lib/supabase/client';

export default function UserMenu() {
  const currentUser = useAppStore((s) => s.currentUser);
  const openAuthModal = useAppStore((s) => s.openAuthModal);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentUser(null);
    setMenuOpen(false);
  };

  const handleHistory = () => {
    setMenuOpen(false);
    if (!currentUser) {
      openAuthModal('history');
    } else {
      router.push('/history');
    }
  };

  if (!currentUser) {
    return (
      <button
        onClick={() => openAuthModal(null)}
        className="text-sm font-medium text-fg-muted hover:text-fg transition-colors"
      >
        Login
      </button>
    );
  }

  const initial = currentUser.email.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-8 h-8 rounded-full bg-accent/10 text-accent text-sm font-semibold
                   flex items-center justify-center hover:bg-accent/20 transition-colors"
      >
        {initial}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-10 w-48 glass rounded-xl shadow-lg py-1 z-50">
          <p className="px-4 py-2 text-xs text-fg-muted truncate border-b border-black/[0.06]">
            {currentUser.email}
          </p>
          <button
            onClick={handleHistory}
            className="w-full px-4 py-2.5 text-sm text-left text-fg hover:bg-black/[0.03] transition-colors"
          >
            History
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-sm text-left text-red-500 hover:bg-red-50/50 transition-colors"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
