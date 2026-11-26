-- TrustMed Academy — missing tables (run ONCE in Supabase Dashboard > SQL Editor).
-- These tables were not part of the first schema run. The PWA works without them,
-- but messaging, scientific references and daily schedules need them.
-- Safe to run repeatedly (IF NOT EXISTS).

-- ---------- Daily schedules ----------
create table if not exists public.daily_schedules (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  title text not null,
  date date not null,
  notes text,
  lecture_count int not null default 0,
  published_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.daily_schedules enable row level security;
drop policy if exists "daily read all" on public.daily_schedules;
create policy "daily read all" on public.daily_schedules for select using (auth.uid() is not null);
drop policy if exists "daily admin write" on public.daily_schedules;
create policy "daily admin write" on public.daily_schedules for all
  using (public.is_admin_or_above() or public.current_role() = 'representative')
  with check (public.is_admin_or_above() or public.current_role() = 'representative');

-- ---------- Weekly schedules (if not already created by the backend SQL) ----------
create table if not exists public.weekly_schedules (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  title text not null,
  week_start date not null,
  week_end date,
  notes text,
  lecture_count int not null default 0,
  published_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.weekly_schedules enable row level security;
drop policy if exists "weekly read all" on public.weekly_schedules;
create policy "weekly read all" on public.weekly_schedules for select using (auth.uid() is not null);
drop policy if exists "weekly admin write" on public.weekly_schedules;
create policy "weekly admin write" on public.weekly_schedules for all
  using (public.is_admin_or_above() or public.current_role() = 'representative')
  with check (public.is_admin_or_above() or public.current_role() = 'representative');

-- ---------- Scientific references (Google Drive books) ----------
create table if not exists public.scientific_references (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  title text not null,
  author text,
  year int,
  drive_url text not null,
  description text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.scientific_references enable row level security;
drop policy if exists "refs read all" on public.scientific_references;
create policy "refs read all" on public.scientific_references for select using (auth.uid() is not null);
drop policy if exists "refs admin write" on public.scientific_references;
create policy "refs admin write" on public.scientific_references for all
  using (public.is_admin_or_above() or public.current_role() = 'doctor')
  with check (public.is_admin_or_above() or public.current_role() = 'doctor');

-- ---------- Messaging: conversations + messages (representative <-> doctor) ----------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  representative_id uuid references public.profiles(id),
  doctor_id uuid references public.doctors(id),
  title text,
  created_at timestamptz not null default now()
);
alter table public.conversations enable row level security;
drop policy if exists "conv participants or admin" on public.conversations;
create policy "conv participants or admin" on public.conversations for select using (
  public.is_admin_or_above()
  or representative_id = auth.uid()
  or doctor_id in (select id from public.doctors where profile_id = auth.uid())
);
drop policy if exists "conv rep create" on public.conversations;
create policy "conv rep create" on public.conversations for insert
  with check (public.current_role() = 'representative' or public.is_admin_or_above());

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  body text not null,
  kind text not null default 'text', -- text | proposal
  proposal_subject_id uuid references public.subjects(id),
  proposal_group_id uuid references public.groups(id),
  proposal_date date,
  proposal_start time,
  proposal_end time,
  proposal_status text, -- pending | accepted | rejected | counter
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
drop policy if exists "msg participants or admin" on public.messages;
create policy "msg participants or admin" on public.messages for select using (
  public.is_admin_or_above()
  or conversation_id in (select id from public.conversations
      where representative_id = auth.uid()
      or doctor_id in (select id from public.doctors where profile_id = auth.uid()))
);
drop policy if exists "msg participant write" on public.messages;
create policy "msg participant write" on public.messages for insert
  with check (
    public.is_admin_or_above()
    or conversation_id in (select id from public.conversations
        where representative_id = auth.uid()
        or doctor_id in (select id from public.doctors where profile_id = auth.uid()))
  );

-- ---------- Approval status (optional, richer than is_active) ----------
alter table public.profiles add column if not exists approval_status text not null default 'approved';
alter table public.profiles add column if not exists approval_reason text;
alter table public.profiles add column if not exists approval_decided_by uuid references public.profiles(id);
alter table public.profiles add column if not exists approval_decided_at timestamptz;

-- Realtime for the new tables
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.daily_schedules;
alter publication supabase_realtime add table public.scientific_references;
