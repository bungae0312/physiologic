-- FitCRM / physiologic 스키마
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 실행하세요.
-- (Table Editor로 만들지 말고 반드시 이 스크립트로 만들어야 RLS 정책까지 함께 적용됩니다.)

-- ============================================================
-- 1. 트레이너 프로필 (auth.users 1:1)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  gym text default '',
  phone text default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

-- 회원가입 시 auth.users에 새 행이 생기면 profiles를 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, gym, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'gym', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. 회원 (members)
-- ============================================================
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text default '',
  gender text default '',
  birth date,
  join_date date,
  membership_type text default '',
  membership_start date,
  membership_end date,
  pt_total integer not null default 0,
  goal text default '',
  memo text default '',
  created_at timestamptz not null default now()
);

create index if not exists members_trainer_id_idx on public.members(trainer_id);

alter table public.members enable row level security;

create policy "members_all_own" on public.members
  for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

-- ============================================================
-- 3. 신체 기록 (body_records)
-- ============================================================
create table if not exists public.body_records (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  trainer_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight numeric,
  muscle numeric,
  fat numeric,
  created_at timestamptz not null default now()
);

create index if not exists body_records_member_id_idx on public.body_records(member_id);

alter table public.body_records enable row level security;

create policy "body_records_all_own" on public.body_records
  for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

-- ============================================================
-- 4. PT 세션 기록 (pt_sessions)
-- ============================================================
create table if not exists public.pt_sessions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  trainer_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  note text default '',
  created_at timestamptz not null default now()
);

create index if not exists pt_sessions_member_id_idx on public.pt_sessions(member_id);

alter table public.pt_sessions enable row level security;

create policy "pt_sessions_all_own" on public.pt_sessions
  for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

-- ============================================================
-- 5. 일정 (schedules)
-- ============================================================
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  date date not null,
  time text default '',
  memo text default '',
  created_at timestamptz not null default now()
);

create index if not exists schedules_trainer_id_date_idx on public.schedules(trainer_id, date);

alter table public.schedules enable row level security;

create policy "schedules_all_own" on public.schedules
  for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

-- ============================================================
-- 6. 결제/매출 (payments)
-- ============================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  date date not null,
  amount numeric not null,
  item text default '',
  created_at timestamptz not null default now()
);

create index if not exists payments_trainer_id_date_idx on public.payments(trainer_id, date);

alter table public.payments enable row level security;

create policy "payments_all_own" on public.payments
  for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());
