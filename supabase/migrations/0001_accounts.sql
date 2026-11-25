-- VoiceDost accounts: profiles, minute grants (top-ups) and usage.
-- Minutes left = plan minutes this month (reset monthly) + top-up minutes
-- (never expire) - minutes used. Plan minutes are spent first.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'creator')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.minute_grants (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  minutes numeric(10, 3) not null check (minutes > 0),
  source text not null check (source in ('topup', 'manual', 'promo')),
  provider_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  minutes numeric(10, 3) not null,
  plan_minutes numeric(10, 3) not null,   -- part taken from this month's plan
  topup_minutes numeric(10, 3) not null,  -- part taken from top-ups
  characters int not null,
  voice text not null,
  created_at timestamptz not null default now()
);
create index if not exists usage_events_user_time on public.usage_events (user_id, created_at);
create index if not exists minute_grants_user on public.minute_grants (user_id);

-- Table access (this project does not grant it automatically).
grant select on public.profiles, public.minute_grants, public.usage_events to authenticated;
grant all on public.profiles, public.minute_grants, public.usage_events to service_role;

-- Row-level security: users can read only their own rows. All writes go
-- through the voice server with the secret key, or the functions below.
alter table public.profiles enable row level security;
alter table public.minute_grants enable row level security;
alter table public.usage_events enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "own grants" on public.minute_grants;
create policy "own grants" on public.minute_grants for select using (auth.uid() = user_id);
drop policy if exists "own usage" on public.usage_events;
create policy "own usage" on public.usage_events for select using (auth.uid() = user_id);

-- New sign-up -> profile on the free plan.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profiles for anyone who signed up before this ran.
insert into public.profiles (id, email)
select id, coalesce(email, '') from auth.users on conflict (id) do nothing;

create or replace function public.plan_minutes(p_plan text) returns numeric
language sql immutable as $$
  select case p_plan when 'starter' then 60 when 'creator' then 180 else 10 end::numeric
$$;

-- Balance for one user: plan minutes left this month and top-up minutes left.
create or replace function public.account_summary(p_user uuid)
returns table (plan text, plan_minutes numeric, plan_left numeric, topup_left numeric,
               minutes_left numeric, period_start timestamptz, period_end timestamptz, is_admin boolean)
language plpgsql stable security definer set search_path = public as $$
declare
  v_start timestamptz := date_trunc('month', now() at time zone 'utc') at time zone 'utc';
  v_end timestamptz := (date_trunc('month', now() at time zone 'utc') + interval '1 month') at time zone 'utc';
  v_plan text; v_admin boolean; v_used_plan numeric; v_granted numeric; v_used_topup numeric;
begin
  select p.plan, p.is_admin into v_plan, v_admin from profiles p where p.id = p_user;
  if v_plan is null then return; end if;
  select coalesce(sum(u.plan_minutes), 0) into v_used_plan from usage_events u
    where u.user_id = p_user and u.created_at >= v_start;
  select coalesce(sum(g.minutes), 0) into v_granted from minute_grants g where g.user_id = p_user;
  select coalesce(sum(u.topup_minutes), 0) into v_used_topup from usage_events u where u.user_id = p_user;
  plan := v_plan;
  plan_minutes := plan_minutes(v_plan);
  plan_left := greatest(plan_minutes(v_plan) - v_used_plan, 0);
  topup_left := greatest(v_granted - v_used_topup, 0);
  minutes_left := plan_left + topup_left;
  period_start := v_start;
  period_end := v_end;
  is_admin := v_admin;
  return next;
end $$;

-- Record one generation, spending plan minutes first, then top-ups.
create or replace function public.record_usage(p_user uuid, p_minutes numeric, p_characters int, p_voice text)
returns numeric
language plpgsql security definer set search_path = public as $$
declare
  s record; v_plan_part numeric; v_topup_part numeric;
begin
  perform 1 from profiles where id = p_user for update;  -- one at a time per user
  select * into s from account_summary(p_user);
  v_plan_part := least(p_minutes, coalesce(s.plan_left, 0));
  v_topup_part := p_minutes - v_plan_part;
  insert into usage_events (user_id, minutes, plan_minutes, topup_minutes, characters, voice)
  values (p_user, p_minutes, v_plan_part, v_topup_part, p_characters, p_voice);
  return greatest(coalesce(s.minutes_left, 0) - p_minutes, 0);
end $$;

-- Only the voice server (secret key) may call these.
revoke all on function public.account_summary(uuid) from public, anon, authenticated;
revoke all on function public.record_usage(uuid, numeric, int, text) from public, anon, authenticated;
grant execute on function public.account_summary(uuid) to service_role;
grant execute on function public.record_usage(uuid, numeric, int, text) to service_role;
