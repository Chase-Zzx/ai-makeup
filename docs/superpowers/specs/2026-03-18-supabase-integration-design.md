# Supabase Integration Design
**Date:** 2026-03-18
**Status:** Approved

## Overview

Add Supabase authentication and database to the AI makeup app. Users can use the app freely without logging in, but are prompted to log in when saving results or viewing history. Auth is email + password only. Data includes generation history and favorites.

## Goals

- Add email/password login via Supabase Auth
- Store generation history (images, style, params) per user
- Store favorites (starred generation history items)
- Keep the existing wizard flow intact — auth via modal, not page redirect
- Support full local development against Supabase cloud project

## Non-Goals

- Social login (Google, WeChat, Apple)
- Offline/local-first storage
- Admin dashboard
- Usage limits or billing

## Database Schema

### `generation_history`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, auto-generated |
| user_id | uuid | FK → auth.users |
| original_image_path | text | Supabase Storage path (e.g. `user_id/gen_id-original.jpg`) |
| generated_image_path | text | Supabase Storage path (e.g. `user_id/gen_id-result.jpg`) |
| style_name | text | e.g. "Natural Glow" |
| makeup_params | jsonb | Full `MakeupParams` object: `{ lipColor, lipIntensity, eyeShadowColor, eyeShadowIntensity, blushLevel, contourLevel, overallIntensity }` |
| created_at | timestamptz | Default now() |

### `user_favorites`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK → auth.users |
| history_id | uuid | FK → generation_history |
| created_at | timestamptz | Default now() |
| — | — | UNIQUE constraint on `(user_id, history_id)` |

### Row Level Security (RLS)
- Both tables: users can only SELECT/INSERT/UPDATE/DELETE their own rows (`user_id = auth.uid()`)
- Supabase Storage bucket `makeup-images`: users can only read/write within their own folder (`user_id/`)

### Storage

- **Bucket:** `makeup-images` (private)
- **File naming:** `{user_id}/{generation_id}-original.jpg` and `{user_id}/{generation_id}-result.jpg`
- **UUID generation:** the client generates `generation_id = crypto.randomUUID()` **before** uploading. This same UUID is used as the Storage path prefix and passed to `/api/save-result` as the `id` value for the DB insert, ensuring path and record stay in sync.
- **URL access:** bucket is private; image URLs are generated as **signed URLs** (TTL: 1 hour) at read time on the `/history` page. Paths (not URLs) are stored in the database.
- **Upload flow — original image:** the browser uploads the user's `File` object (from `uploadState.file`) **directly to Supabase Storage** using the anon key + RLS.
- **Upload flow — generated image:** the Replicate result is a CDN URL string, not a `File`. To avoid CORS issues with fetching it client-side, a thin server-side relay route `/api/download-and-upload` fetches the Replicate URL, then uploads the resulting bytes to Supabase Storage using the service role key, and returns the storage path. This is the only place the service role key is used, and only to write to the user's own folder.
- After both uploads succeed, the client calls `/api/save-result` with the storage paths, `generation_id`, and metadata to insert the DB record.

## Authentication Flow

### Email Confirmation
Email confirmation is **disabled** for this app (set in Supabase Dashboard → Auth → Email → disable "Confirm email"). Users can log in immediately after registering.

### Trigger Points
1. User clicks "Save" after generating a result → `pendingAction = 'save'` → AuthModal opens
2. User clicks "History" in navbar → `pendingAction = 'history'` → AuthModal opens if not logged in

### AuthModal
- Glass-card style matching existing UI
- Two tabs: Login / Register
- Email + password fields
- On success: modal closes, pending action executes automatically (`save` → triggers save flow; `history` → navigates to `/history`)

### Navbar
- **Unauthenticated:** "登录" button (top right)
- **Authenticated:** Avatar initials (first letter of email) + dropdown (历史记录, 退出登录)

## New Routes & Pages

### `/history`
- Protected via `src/middleware.ts`: uses `@supabase/ssr` `createServerClient` with the request cookies and calls `supabase.auth.getUser()` to validate session liveness (not just cookie presence). Redirects to `/?authRequired=true` if unauthenticated or token is expired.
- `/history/page.tsx` is a **Client Component**. It reads the `?authRequired=true` query param using the `useSearchParams()` hook from `next/navigation`. On mount, if the param is present, it sets `authModalOpen = true` and `pendingAction = 'history'` in the store, so the login modal opens automatically.
- Grid of past generation cards (thumbnail via signed URL, style name, date)
- Star icon to toggle favorite (upsert / delete on `user_favorites`)
- Click card → loads saved `makeup_params` into store and navigates to finetune step. The "Regenerate" button is **disabled** when entering from history (no `File` object available — only a Storage path).
- Images rendered with `<img>` tags (not `next/image`) using signed Supabase Storage URLs

### `/api/save-result`
- POST endpoint (JSON body, no file upload)
- Receives: `{ id, originalImagePath, generatedImagePath, styleName, makeupParams }`
- Uses `createServerClient` from `@supabase/ssr` with request cookies to authenticate the caller — RLS enforces ownership via `auth.uid()`. No service role key is used.
- Inserts row into `generation_history` (using client-provided `id` as primary key)
- Returns the new record `{ id }`

## File Structure

```
src/
  middleware.ts                    # Session guard: createServerClient + getUser(); protects /history; redirects to /?authRequired=true
  lib/
    supabase/
      client.ts                    # createBrowserClient() — used in Client Components
      server.ts                    # createServerClient() — used in API routes
  components/
    auth/
      AuthModal.tsx                # Login/register modal (GlassCard styled); accepts onSuccess callback prop
      UserMenu.tsx                 # Avatar initials + dropdown menu
    ClientProviders.tsx            # 'use client' wrapper; houses useAuthSync(), <UserMenu>, <AuthModal>; inserted into layout.tsx
  app/
    history/
      page.tsx                     # History grid (Client Component); reads ?authRequired via useSearchParams()
    api/
      save-result/
        route.ts                   # Insert generation record into DB (createServerClient + request cookies)
      download-and-upload/
        route.ts                   # Fetch Replicate URL server-side, upload to Storage (service role key)
```

## Zustand Store Changes (`appStore.ts`)

New fields added to the existing store:

```ts
currentUser: { id: string; email: string } | null  // null = unauthenticated
authModalOpen: boolean
pendingAction: 'save' | 'history' | null            // action to run after login
```

- `currentUser` is initialized on app mount by calling `supabase.auth.getUser()` and listening to `onAuthStateChange`
- Initialization code lives in a `useAuthSync` hook called from the root layout
- `pendingAction` is passed as a prop to `AuthModal`; on auth success, the modal reads it, executes the action, and resets both `authModalOpen` and `pendingAction`
- The existing `reset()` action must also clear `currentUser` to `null`, `authModalOpen` to `false`, and `pendingAction` to `null`

## Dependencies

```
@supabase/supabase-js
@supabase/ssr
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Integration Points in Existing Code

- `src/app/layout.tsx` — remains a Server Component. A new `ClientProviders` Client Component wrapper is added inside it to house `useAuthSync()` and `<UserMenu>`. `<AuthModal>` is also rendered inside `ClientProviders` so it is available on every page.
- `src/app/page.tsx` — add "Save" button in finetune step; on click checks `currentUser`; if null, sets `pendingAction = 'save'` and `authModalOpen = true`; if logged in, calls the save function directly.
- `src/stores/appStore.ts` — add `currentUser`, `authModalOpen`, `pendingAction` fields; update `reset()` to clear them.
- `src/components/finetune/` — Save button triggers save or opens auth modal. The save logic lives here (not inside `AuthModal`). `AuthModal` accepts an `onSuccess` callback prop; when `pendingAction = 'save'`, the save button passes its own save function as the callback.

## Error Handling

- Auth errors: inline form validation messages (wrong password, email already taken)
- Save errors: toast notification; result stays visible so user can retry
- Storage upload failure: retry once, then show error toast with option to retry manually
- Signed URL expiry on `/history`: regenerate on page focus via `visibilitychange` event

## Testing Plan

1. Register new user → verify immediate login (no email confirmation required)
2. Login with wrong password → verify inline error message
3. Generate makeup without login → verify wizard works normally; no save prompt until "Save" clicked
4. Click "Save" → verify AuthModal opens; after login, save proceeds automatically
5. Verify images appear in Supabase Storage under `user_id/` folder
6. Verify row inserted in `generation_history` with correct `makeup_params` (all 7 fields)
7. Navigate to `/history` (unauthenticated) → verify redirect to `/?authRequired=true`
8. Navigate to `/history` (authenticated) → verify correct records shown with images
9. Toggle favorite star → verify `user_favorites` insert; toggle again → verify delete; no duplicate rows
10. Click history card → verify finetune step loads with all 7 saved params restored
11. Logout → verify session cleared; `/history` redirects to home
