# TrustMed Academy — Standalone PWA (deployable)

Static, installable web app for **TRUST IN MED — Faculty of Human Medicine, Batch 11**.
It talks directly to the live Supabase project (PostgreSQL + Auth + Storage).
No build step, no server, no secrets in code.

## Live Supabase project (verified 2026-11-26)

- Project: `trust-in-med` — `https://jezkxfmrwfebevwrfnal.supabase.co`
- Region: Tokyo (ap-northeast-1)
- Data: Batch 11 (B11, 2025–2026), Groups 1–19, 4 subjects (Microbiology, Pathology,
  Pharmacology, Biochemistry — 10 planned lectures each), 0 lectures, 0 doctors, 0 rooms.
- Google OAuth provider: **ENABLED** in Supabase Auth.
- Tables confirmed missing (app degrades gracefully, see below):
  `conversations`, `messages`, `scientific_references`, `daily_schedules`.

## What is inside

| File | Purpose |
|---|---|
| `index.html` | App shell — login, dashboard, schedule, progress, late groups, schedules, library, notifications, reports, messages, AI assistant, users, settings |
| `app.js` | All logic (vanilla JS, Supabase JS v2 from CDN) |
| `styles.css` | Mobile-first RTL styles |
| `config.js` | Supabase URL + **publishable** key (public by design; RLS enforces access) |
| `manifest.json`, `sw.js`, `icon.svg` | PWA install (Add to Home Screen) |
| `vercel.json` | Static-site headers for Vercel |
| `sql/missing_tables.sql` | Creates `daily_schedules`, `weekly_schedules`, `scientific_references`, `conversations`, `messages` + approval columns |

## Features

1. **Login** — Google button (Supabase Auth OAuth) + email/password. New Google users
   are created as students with no batch/group: they see an Arabic
   "طلبك قيد المراجعة" screen and get no data access until a Super Admin approves
   them (Users view: approve → assign role/batch/group, or reject → deactivate).
2. **Dashboard** — Batch 11, 19 groups, per-subject completion % vs planned (10),
   group comparison table (vs planned, not vs existing).
3. **Master Schedule** — add/edit/delete lectures; subject, group, lecture number
   **per subject per group** (duplicate completed number rejected in Arabic),
   type (نظري/عملي/معمل/سريري), date, start/end (end must be after start),
   doctor, room, status (not_taken/completed/postponed/cancelled). Quick entry
   creates one independent record per selected group.
4. **Group Progress** — per group per subject: completed numbers, remaining numbers, %;
   all-19-groups comparison.
5. **Late Groups board** — every group behind in each subject with exact missing
   numbers and count in Arabic, e.g. "المجموعة السادسة ناقصها 4 محاضرات في علم
   الأمراض - المحاضرات رقم 7، 8، 9، 10", plus a button to schedule the next
   missing lecture for tomorrow (students of that group are notified).
6. **Daily + weekly schedules** — publish, edit after publishing, delete.
   (Needs `daily_schedules`/`weekly_schedules` tables — see SQL below.)
7. **Library** — lecture files from the Supabase Storage bucket `lecture-files`
   (list/download; upload for admin/doctor), plus **Scientific References** per
   subject: Google Drive share links auto-converted to view + direct-download URLs,
   search by title/author; add/edit/delete for admin/doctor, student read-only.
8. **Notifications** — per-user list, mark read / mark all read.
9. **Reports** — group / all-groups / subject / comparison reports from live data,
   printable view + `window.print()` (Save as PDF), with TRUST IN MED header,
   Faculty of Human Medicine, batch/group, date, tables, statistics, and a footer
   with Telegram https://t.me/Trustin_Med. Audit report is admin-only; students
   see only their own group's reports.
10. **Messaging (rep↔doctor)** — conversations + messages in Supabase when the
    tables exist. If they are missing, the Messages view shows an Arabic note
    explaining that `sql/missing_tables.sql` must be run; all other features
    keep working.
11. **AI assistant** — rule-based, **no external key**: answers from the fetched
    live data ("ما هي محاضراتي غداً؟", per-subject counts, late-groups summary,
    tomorrow's schedule suggestion). Role/group scoped — a student only ever
    sees their own group.
12. **Settings** — live Supabase connection status + per-table availability,
    logo upload (browser localStorage only, shown in header/reports),
    homepage/privacy URL fields for the Google OAuth publishing step.

## First Super Admin (important)

The internal accounts (`superadmin` / `TrustMed@2026` etc.) exist **only** in the
old artifact's server database, NOT in Supabase — they are intentionally **not**
in this code. To create the first Super Admin:

1. Open the deployed site, click **إنشاء حساب جديد**, sign up with your email
   and a strong password (or sign in with Google).
2. In Supabase Dashboard → Authentication → Users, confirm the user exists;
   in Table Editor → `profiles`, find the row for that user and set
   `role = super_admin`, `is_active = true`.
3. Sign in again — you are now Super Admin and can approve other users from
   the Users view.

## Enable the missing tables (one-time, 2 minutes)

In Supabase Dashboard → SQL Editor, run `sql/missing_tables.sql`. It creates
`daily_schedules`, `weekly_schedules`, `scientific_references`,
`conversations`, `messages` (with RLS) and adds approval columns to `profiles`.
Until then, the app shows a clear Arabic note in the affected views and
everything else works.

## Deploy to Vercel

### Option A — GitHub (recommended)

```bash
cd trustmed-academy-web
git init && git add . && git commit -m "TrustMed Academy PWA"
git remote add origin https://github.com/medicalhealthuk9-dot/trustmed-academy.git
git push -u origin main
```

Then in Vercel: **Add New → Project → Import** the repo, framework preset
**Other** (static, no build command), and deploy. No environment variables are
required — the public Supabase URL/key are already in `config.js` — but if you
prefer, set these and the app will use them when `config.js` is replaced by a
build step:

- `NEXT_PUBLIC_SUPABASE_URL=https://jezkxfmrwfebevwrfnal.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_NMCB9M85WDGMZ_WMv2T5hw_gQrbUkeQ`

The site gets a `*.vercel.app` domain (e.g. `trustmed-academy.vercel.app`).

### Option B — Vercel CLI

```bash
npx vercel --prod
```

## Google OAuth publishing (for all Google accounts)

The OAuth consent screen is in **Testing** — only the test user
`medicalhealthuk9@gmail.com` can sign in with Google. To open it to everyone:
Google Cloud → APIs & Services → OAuth consent screen → Publish app.
Google requires a **homepage URL** (the Vercel URL above) and a **privacy policy
URL** — enter them in the app's Settings page first so they are recorded.

## APK / AAB (after Vercel)

The deployed PWA URL is wrapped into Android packages:

- **PWA install (free, immediate):** open the Vercel link on the phone →
  "Add to Home Screen".
- **APK/AAB:** wrap the published URL with Capacitor or a Trusted Web Activity
  (e.g. `npx @capacitor/cli init`, add Android platform, `npx cap sync`,
  open in Android Studio → Build → Generate Signed Bundle/APK). AAB is the
  format Google Play requires; APK is for direct install. Play Store upload
  needs a Google Play developer account ($25 one-time) and remains the owner's
  step.

## Intentional limits vs the full artifact

- **AI assistant is rule-based** (keyword + live-data snapshot), not an LLM call —
  it needs no key, account, or payment, and never invents data.
- **Messaging / references / daily schedules** need `sql/missing_tables.sql`
  run once; until then those views show an Arabic note instead of failing.
- **Reports are printable HTML** (browser Save-as-PDF), not server-generated PDF
  files; the in-app PDF engine of the artifact is not reproduced here.
- **No service_role key anywhere.** All writes go through the publishable key
  under RLS; the permissive "trustmed app access" policies on the core tables
  are what make the publishable key work — tighten them to scoped RLS in
  Supabase if you want stricter enforcement (see the original `schema.sql`).

## Local test

```bash
cd trustmed-academy-web
python3 -m http.server 8080
# open http://localhost:8080 — login page loads; sign in to see live data
```
