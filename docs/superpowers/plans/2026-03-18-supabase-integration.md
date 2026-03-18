# Supabase Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase auth (email/password) and database (generation history + favorites) to the AI makeup app, with a modal-based login flow that doesn't break the existing wizard UX.

**Architecture:** Supabase handles auth, database, and file storage. The browser client handles auth state and uploads original images directly to Storage. A server-side relay route handles generated image uploads (CORS). A middleware protects the `/history` route. The Zustand store gains auth fields. A `ClientProviders` wrapper in the root layout houses auth sync and global UI (modal, user menu).

**Tech Stack:** Supabase (Auth, PostgreSQL, Storage), @supabase/supabase-js, @supabase/ssr, Next.js 14 App Router, Zustand, TypeScript, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-18-supabase-integration-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/supabase/client.ts` | Create | Browser Supabase client (`createBrowserClient()`) |
| `src/lib/supabase/server.ts` | Create | Server Supabase client (`createServerClient()` with cookies) |
| `src/middleware.ts` | Create | Protect `/history`, refresh session, redirect if unauthenticated |
| `src/types/index.ts` | Modify | Add `GenerationHistoryRecord`, `UserFavorite` types |
| `src/stores/appStore.ts` | Modify | Add `currentUser`, `authModalOpen`, `pendingAction`; update `reset()` |
| `src/components/auth/AuthModal.tsx` | Create | Login/register modal with tabs, glass-card style, `onSuccess` callback |
| `src/components/auth/UserMenu.tsx` | Create | Avatar initials + dropdown (history, logout) |
| `src/components/ClientProviders.tsx` | Create | `'use client'` wrapper for layout: `useAuthSync`, `<AuthModal>`, `<UserMenu>` |
| `src/app/layout.tsx` | Modify | Insert `<ClientProviders>` wrapper inside `<body>` |
| `src/app/api/save-result/route.ts` | Create | Insert generation record into DB (server client + cookies) |
| `src/app/api/download-and-upload/route.ts` | Create | Fetch Replicate URL server-side, upload to Storage |
| `src/components/finetune/FineTunePanel.tsx` | Modify | Add "Save" button, save flow logic, auth gate |
| `src/app/history/page.tsx` | Create | History grid page with signed URLs, favorites, re-enter finetune |
| `src/app/page.tsx` | Modify | Read `?authRequired` param, open auth modal if present |

---

## Task 1: Install Dependencies and Configure Environment

**Files:**
- Modify: `package.json`
- Create: `.env.local.example`

- [ ] **Step 1: Install Supabase packages**

```bash
cd /Users/uw/Desktop/ai-makeup && npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Create `.env.local.example`**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 3: Create `.env.local` with real values**

Ask the user for their Supabase project URL, anon key, and service role key. Populate `.env.local`. Verify `.env.local` is in `.gitignore`.

- [ ] **Step 4: Verify build still works**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "chore: add Supabase dependencies and env config"
```

---

## Task 2: Create Supabase Client Utilities

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`

- [ ] **Step 1: Create browser client**

Create `src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create server client**

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: No errors (unused files are fine — tree-shaking handles it).

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat: add Supabase browser and server client utilities"
```

---

## Task 3: Add Auth Fields to Zustand Store

**Files:**
- Modify: `src/stores/appStore.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add new types to `src/types/index.ts`**

Append after existing types:

```ts
export interface GenerationHistoryRecord {
  id: string;
  user_id: string;
  original_image_path: string;
  generated_image_path: string;
  style_name: string;
  makeup_params: MakeupParams;
  created_at: string;
  is_favorite?: boolean;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  history_id: string;
  created_at: string;
}

export type PendingAction = 'save' | 'history' | null;
```

- [ ] **Step 2: Add auth fields to `AppState` interface in `appStore.ts`**

Add after the existing interface fields (before `reset`):

```ts
  // Auth
  currentUser: { id: string; email: string } | null;
  authModalOpen: boolean;
  pendingAction: PendingAction;
  setCurrentUser: (user: { id: string; email: string } | null) => void;
  setAuthModalOpen: (open: boolean) => void;
  setPendingAction: (action: PendingAction) => void;
  openAuthModal: (action: PendingAction) => void;
  closeAuthModal: () => void;

  // History navigation
  fromHistory: boolean;
  setFromHistory: (val: boolean) => void;
```

- [ ] **Step 3: Add auth field implementations to the store**

Add after existing implementations, before `reset`:

```ts
  // Auth
  currentUser: null,
  authModalOpen: false,
  pendingAction: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setPendingAction: (action) => set({ pendingAction: action }),
  openAuthModal: (action) =>
    set({ authModalOpen: true, pendingAction: action }),
  closeAuthModal: () =>
    set({ authModalOpen: false, pendingAction: null }),

  // History navigation
  fromHistory: false,
  setFromHistory: (val) => set({ fromHistory: val }),
```

- [ ] **Step 4: Update `reset()` to clear auth-related UI fields**

Update the `reset` function to also set:

```ts
  authModalOpen: false,
  pendingAction: null,
  fromHistory: false,
```

**Do NOT clear `currentUser` in `reset()`.** The spec says to, but resetting the wizard should not log the user out — that would be a UX bug. Logging out is handled by `UserMenu.handleLogout()` which calls `setCurrentUser(null)` directly.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/stores/appStore.ts src/types/index.ts
git commit -m "feat: add auth and history fields to Zustand store"
```

---

## Task 4: Create AuthModal Component

**Files:**
- Create: `src/components/auth/AuthModal.tsx`

- [ ] **Step 1: Create `AuthModal.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/AuthModal.tsx
git commit -m "feat: add AuthModal component with login/register tabs"
```

---

## Task 5: Create UserMenu Component

**Files:**
- Create: `src/components/auth/UserMenu.tsx`

- [ ] **Step 1: Create `UserMenu.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/UserMenu.tsx
git commit -m "feat: add UserMenu component with avatar dropdown"
```

---

## Task 6: Create ClientProviders and Wire Into Layout

**Files:**
- Create: `src/components/ClientProviders.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create `ClientProviders.tsx`**

```tsx
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
```

- [ ] **Step 2: Update `src/app/layout.tsx`**

Wrap `{children}` with `<ClientProviders>`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GlowAI — AI Makeup Generator",
  description:
    "Upload a selfie and discover your ideal makeup looks with AI-powered style generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-[#faf9f6] text-[#1a1a1a] antialiased noise-overlay`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify build and visual check**

```bash
npm run build && npm run dev
```

Open http://localhost:3000. Verify: "Login" button visible top-right corner. Click it — AuthModal opens. Close it. No visual regressions on existing pages.

- [ ] **Step 4: Commit**

```bash
git add src/components/ClientProviders.tsx src/app/layout.tsx
git commit -m "feat: add ClientProviders with auth sync, modal, and user menu in layout"
```

---

## Task 7: Create Middleware for Route Protection

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create `src/middleware.ts`**

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — IMPORTANT: must call getUser(), not getSession()
  const { data: { user } } = await supabase.auth.getUser();

  // Protect /history
  if (request.nextUrl.pathname.startsWith('/history') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('authRequired', 'true');
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/history/:path*'],
};
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add middleware to protect /history route with session validation"
```

---

## Task 8: Supabase Dashboard Setup (Manual)

This task is performed manually in the Supabase Dashboard. No code changes. **Must be done before testing any API routes or the history page.**

- [ ] **Step 1: Create `generation_history` table**

In Supabase SQL Editor, run:

```sql
CREATE TABLE generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_image_path TEXT NOT NULL,
  generated_image_path TEXT NOT NULL,
  style_name TEXT NOT NULL,
  makeup_params JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own history"
  ON generation_history
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 2: Create `user_favorites` table**

```sql
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  history_id UUID REFERENCES generation_history(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, history_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites"
  ON user_favorites
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 3: Create `makeup-images` storage bucket**

In Storage section, create a new bucket named `makeup-images` with:
- **Public:** OFF (private)
- Add RLS policies:

```sql
CREATE POLICY "Users can upload to own folder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'makeup-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own folder"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'makeup-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

- [ ] **Step 4: Disable email confirmation**

In Supabase Dashboard -> Auth -> Email -> Uncheck "Confirm email".

---

## Task 9: Create API Routes

**Files:**
- Create: `src/app/api/save-result/route.ts`
- Create: `src/app/api/download-and-upload/route.ts`

- [ ] **Step 1: Create `/api/save-result/route.ts`**

```ts
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
```

- [ ] **Step 2: Create `/api/download-and-upload/route.ts`**

```ts
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
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/save-result/ src/app/api/download-and-upload/
git commit -m "feat: add save-result and download-and-upload API routes"
```

---

## Task 9: Add Save Button to FineTunePanel

**Files:**
- Modify: `src/components/finetune/FineTunePanel.tsx`

- [ ] **Step 1: Add save logic and Save button**

Add imports at the top of `FineTunePanel.tsx`:

```ts
import { createClient } from '@/lib/supabase/client';
```

Add new store selectors inside the component:

```ts
const currentUser = useAppStore((s) => s.currentUser);
const openAuthModal = useAppStore((s) => s.openAuthModal);
const fromHistory = useAppStore((s) => s.fromHistory);
```

Add save state and handler:

```ts
const [isSaving, setIsSaving] = useState(false);
const [saveMessage, setSaveMessage] = useState<string | null>(null);
const [pendingSave, setPendingSave] = useState(false);

const doSave = useCallback(async () => {
  // Read fresh state from store to avoid stale closures after auth
  const { currentUser: user, uploadedFile: file, aiImageUrl: imageUrl, selectedStyle: style, makeupParams: params } = useAppStore.getState();
  if (!imageUrl || !style || !file || !user) return;

  setIsSaving(true);
  setSaveMessage(null);

  try {
    const supabase = createClient();
    const generationId = crypto.randomUUID();

    // Upload original image directly to Storage
    const originalPath = `${user.id}/${generationId}-original.jpg`;
    const { error: origError } = await supabase.storage
      .from('makeup-images')
      .upload(originalPath, file, { contentType: file.type, upsert: false });
    if (origError) throw new Error(`Original upload failed: ${origError.message}`);

    // Upload generated image via server relay
    const generatedPath = `${user.id}/${generationId}-result.jpg`;
    const relayRes = await fetch('/api/download-and-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceUrl: imageUrl, storagePath: generatedPath }),
    });
    if (!relayRes.ok) {
      const err = await relayRes.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error);
    }

    // Save DB record
    const saveRes = await fetch('/api/save-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: generationId,
        originalImagePath: originalPath,
        generatedImagePath: generatedPath,
        styleName: style.name,
        makeupParams: params,
      }),
    });
    if (!saveRes.ok) {
      const err = await saveRes.json().catch(() => ({ error: 'Save failed' }));
      throw new Error(err.error);
    }

    setSaveMessage('Saved!');
    setTimeout(() => setSaveMessage(null), 3000);
  } catch (err) {
    setSaveMessage(err instanceof Error ? err.message : 'Save failed');
    setTimeout(() => setSaveMessage(null), 5000);
  } finally {
    setIsSaving(false);
    setPendingSave(false);
  }
}, []);

// Watch for auth completion when save was pending
useEffect(() => {
  if (pendingSave && currentUser) {
    doSave();
  }
}, [pendingSave, currentUser, doSave]);

const handleSaveClick = useCallback(() => {
  if (!currentUser) {
    setPendingSave(true);
    openAuthModal('save');
  } else {
    doSave();
  }
}, [currentUser, openAuthModal, doSave]);
```

Add the `useState` import (it's not currently imported). Update the import line:

```ts
import { useCallback, useState } from 'react';
```

Add Save button in the bottom actions area, after the `<ExportActions>` line:

```tsx
{/* Save to account */}
{aiImageUrl && !fromHistory && (
  <button
    type="button"
    className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
    onClick={handleSaveClick}
    disabled={isSaving}
  >
    {isSaving ? (
      <>
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Saving...
      </>
    ) : saveMessage ? (
      saveMessage
    ) : (
      <>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        Save to Account
      </>
    )}
  </button>
)}
```

Also disable the Regenerate button when `fromHistory` is true. Update the Regenerate button's `disabled` prop:

```tsx
disabled={isRegenerating || fromHistory}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Manual test**

Run dev server. Go through the wizard. After generating a makeup look, verify:
- "Save to Account" button appears
- Clicking it opens the AuthModal
- After logging in, save proceeds

- [ ] **Step 4: Commit**

```bash
git add src/components/finetune/FineTunePanel.tsx
git commit -m "feat: add Save button to FineTunePanel with auth gate and upload flow"
```

---

## Task 10: Handle `?authRequired` on Main Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add `?authRequired` detection**

Add imports at top of `page.tsx`:

```ts
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
```

Create a small component that reads the query param (must be inside a `<Suspense>` boundary for Next.js 14 production builds):

```tsx
function AuthRequiredDetector() {
  const searchParams = useSearchParams();
  const openAuthModal = useAppStore((s) => s.openAuthModal);

  useEffect(() => {
    if (searchParams.get('authRequired') === 'true') {
      openAuthModal('history');
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams, openAuthModal]);

  return null;
}
```

Add `useEffect` to the existing import from React.

Inside the `Home` component's return, add inside `<main>` before the `<AnimatePresence>`:

```tsx
<Suspense fallback={null}>
  <AuthRequiredDetector />
</Suspense>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: detect ?authRequired param and auto-open auth modal"
```

---

## Task 11: Create History Page

**Files:**
- Create: `src/app/history/page.tsx`

- [ ] **Step 1: Create `/history/page.tsx`**

```tsx
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
  }, [currentUser, supabase]);

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
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/history/
git commit -m "feat: add history page with signed URLs, favorites, and re-enter finetune"
```

---

## Task 13: End-to-End Manual Testing

- [ ] **Step 1: Register a new user**

Go to localhost:3000. Click "Login" in top right. Switch to "Register" tab. Enter email + password. Verify immediate login (avatar appears).

- [ ] **Step 2: Full wizard flow with save**

Upload a selfie → Generate styles → Select a style → Fine-tune → Click "Save to Account". Verify "Saved!" appears. Check Supabase Dashboard: row in `generation_history`, files in Storage bucket.

- [ ] **Step 3: History page**

Click avatar → "History". Verify grid shows the saved look with a thumbnail. Click the star to favorite. Click the card → verify finetune step loads with saved params. Verify "Regenerate" button is disabled.

- [ ] **Step 4: Logout and access control**

Log out. Navigate to `/history` directly in the URL bar. Verify redirect to `/?authRequired=true` and auth modal opens automatically.

- [ ] **Step 5: Login with wrong password**

Try logging in with wrong password. Verify inline error message appears.

- [ ] **Step 6: Commit final state**

```bash
git add -A
git status
git commit -m "feat: complete Supabase integration — auth, history, favorites, storage"
```
