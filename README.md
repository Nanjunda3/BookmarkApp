# 🔖 Markd — Smart Bookmark Manager

> **Live URL:**  ← _Replace with your Vercel URL after deployment_

A fast, private bookmark manager built with Next.js App Router, Supabase, and Tailwind CSS. Bookmarks sync in real-time across all open tabs without a page refresh.

---

## Features

- **Google OAuth** — sign in with Google, no password needed
- **Private bookmarks** — row-level security ensures users only see their own data
- **Real-time sync** — Supabase Realtime pushes changes to all open tabs instantly
- **Add & delete** — clean form with URL validation and confirmation before delete
- **Responsive** — mobile-first layout, works on all screen sizes
- **Fast first load** — bookmarks are server-rendered, then kept in sync client-side

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (Google OAuth 2.0) |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime (Postgres replication) |
| Hosting | Vercel |
| CI | GitHub Actions |
| E2E Tests | Playwright |

---

## Run Locally

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google Cloud](https://console.cloud.google.com) OAuth app

### 1. Clone the repo

```bash
git clone https://github.com/Nanjunda3/BookmarkApp
cd bookmark-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase Setup

### Step 1 — Create a project

Go to [supabase.com](https://supabase.com), create a new project, and wait for it to provision.

### Step 2 — Run the migration

In your Supabase dashboard, go to **SQL Editor** and paste the contents of `migrations/001_bookmarks.sql`. Click **Run**.

This creates the `bookmarks` table, indexes, and all RLS policies.

### Step 3 — Enable Realtime

1. Go to **Database → Replication** in your Supabase dashboard
2. Find the `bookmarks` table and toggle it **ON**

### Step 4 — Enable Google OAuth

1. In Supabase dashboard, go to **Authentication → Providers**
2. Enable **Google** provider
3. Add your Google Client ID and Secret (see below)
4. Copy the **Callback URL** shown (looks like `https://your-project.supabase.co/auth/v1/callback`)

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Go to **APIs & Services → OAuth consent screen**
   - Choose **External**, fill in app name and email
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for local dev)
     - `https://your-app.vercel.app` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (for local dev)
     - `https://your-project.supabase.co/auth/v1/callback` (for Supabase)
5. Copy the **Client ID** and **Client Secret** into Supabase's Google provider settings

---

## Run Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install --with-deps chromium

# Build the app first
npm run build

# Run E2E tests
npm run test:e2e

# View the HTML report
npx playwright show-report
```

---

## Deployment to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

### Option B — GitHub integration

1. Push your repo to GitHub (make sure it's public)
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Set **Framework Preset** to `Next.js`
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**

### After deploying

1. Copy your Vercel URL (e.g. `https://bookmark-app-xyz.vercel.app`)
2. Add it as an authorized JavaScript origin and redirect URI in your Google OAuth app
3. Update the README with your live URL
4. Test by signing in with your own Google account

---

## Design Decisions

**Why Supabase Realtime over polling?**  
Realtime uses Postgres logical replication, which is event-driven — no wasted network requests. The `filter: user_id=eq.{uid}` option ensures users only receive their own change events.

**Why server-side initial fetch?**  
The dashboard fetches bookmarks server-side in a Server Component. This means the HTML is fully populated on first load (no loading spinner flash), and the Realtime subscription only needs to handle subsequent changes.

**Why App Router over Pages Router?**  
App Router enables server components for data fetching and layout sharing. The auth guard (`redirect()` in Server Components) prevents any client-side flash of unauthenticated content.

**URL validation approach:**  
The WHATWG `URL` constructor is used instead of regex. It handles edge cases correctly (IDNs, ports, paths) and is the browser-native standard. The validator also auto-prepends `https://` if the user forgets the protocol.

**RLS as the security layer:**  
Rather than relying on application-level filtering, Row Level Security in Postgres enforces data isolation at the database level. Even if application code had a bug, users could never read each other's data.

---

## Problems Encountered & Solutions

### Problem 1: OAuth redirect URL in production vs. local

**Issue:** The OAuth callback URL needs to be hardcoded in Google Cloud Console, but differs between local (`localhost:3000`) and production (Vercel URL).

**Solution:** Added both URLs to Google's authorized redirect URIs. In the app, the `redirectTo` option uses `window.location.origin` dynamically so it always points to the current environment's callback.

### Problem 2: `cookies()` from `next/headers` behaves differently in Server vs. Route Handler contexts

**Issue:** In Next.js 15, `cookies()` is async and calling `set` from a Server Component throws a warning.

**Solution:** Wrapped `setAll` in a try/catch in the server Supabase client. Setting cookies from Server Components is intentionally a no-op — cookies are only set from Route Handlers (the callback route), which is the correct pattern.

### Problem 3: Realtime subscription receiving duplicate events

**Issue:** When a bookmark is inserted via the Supabase client, the Realtime subscription fires immediately. The state could briefly have duplicate entries.

**Solution:** Added a `prev.find(b => b.id === newBookmark.id)` guard in the INSERT handler to deduplicate before updating state.

### Problem 4: Favicon CORS on some domains

**Issue:** Some favicons loaded via `s2.googleusercontent.com` fail silently due to CSP or CORS issues.

**Solution:** Added an `onError` handler on the favicon `<Image>` component that falls back to a generic globe SVG icon. This is documented as a known limitation.

---

## Project Structure

```
bookmark-app/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Root redirect (/ → /login or /dashboard)
│   ├── globals.css             # Global styles + Tailwind
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── dashboard/
│   │   └── page.tsx            # Protected dashboard (server component)
│   └── auth/
│       └── callback/
│           └── route.ts        # OAuth callback handler
├── components/
│   ├── LoginButton.tsx         # Google sign-in button
│   ├── Header.tsx              # Top navigation with user menu
│   ├── AddBookmarkForm.tsx     # Add bookmark form with validation
│   ├── BookmarkCard.tsx        # Individual bookmark card with delete
│   └── BookmarkList.tsx        # List + Realtime subscription owner
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase client
│   ├── types.ts                # TypeScript interfaces
│   └── utils.ts                # URL validation, formatting helpers
├── migrations/
│   └── 001_bookmarks.sql       # Table + RLS policies
├── tests/
│   └── e2e/
│       └── bookmarks.spec.ts   # Playwright tests
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI
├── .env.local.example          # Environment variable template
├── playwright.config.ts
├── tailwind.config.ts
├── next.config.ts
├── vercel.json
└── README.md
```

---

## Known Limitations

- **Favicon fallback:** Google's favicon service (`s2.googleusercontent.com`) may fail for some obscure domains. Falls back to a generic icon.
- **OAuth test accounts:** Google OAuth requires app verification for production use with many users. For reviewer testing, the app can be left in "testing" mode with the reviewer's email added as a test user in Google Cloud Console.
- **Realtime filter requires Postgres Replication:** The `filter` parameter in Supabase Realtime only works when replication is enabled for the table. This step must be done manually in the Supabase dashboard.

---

## License

MIT
