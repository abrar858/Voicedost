-- The voice server calls these with the signed-in user's own login token,
-- so no secret key is needed anywhere. Each function only touches the
-- caller's own account (auth.uid()).

drop function if exists public.account_summary(uuid);
drop function if exists public.record_usage(uuid, numeric, int, text);

create or replace function public.account_summary()
returns table (plan text, plan_minutes numeric, plan_left numeric, topup_left numeric,
               minutes_left numeric, period_start timestamptz, period_end timestamptz, is_admin boolean)
language plpgsql stable security definer set search_path = public as $$
declare
  p_user uuid := auth.uid();
  v_start timestamptz := date_trunc('month', now() at time zone 'utc') at time zone 'utc';
  v_end timestamptz := (date_trunc('month', now() at time zone 'utc') + interval '1 month') at time zone 'utc';
  v_plan text; v_admin boolean; v_used_plan numeric; v_granted numeric; v_used_topup numeric;
begin
  if p_user is null then return; end if;
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

-- Record one generation for the caller, spending plan minutes first, then top-ups.
create or replace function public.record_usage(p_minutes numeric, p_characters int, p_voice text)
returns numeric
language plpgsql security definer set search_path = public as $$
declare
  p_user uuid := auth.uid();
  s record; v_plan_part numeric; v_topup_part numeric;
begin
  if p_user is null then raise exception 'not signed in'; end if;
  if p_minutes is null or p_minutes <= 0 or p_minutes > 120 then raise exception 'bad minutes'; end if;
  perform 1 from profiles where id = p_user for update;  -- one at a time per user
  select * into s from account_summary();
  v_plan_part := least(p_minutes, coalesce(s.plan_left, 0));
  v_topup_part := p_minutes - v_plan_part;
  insert into usage_events (user_id, minutes, plan_minutes, topup_minutes, characters, voice)
  values (p_user, p_minutes, v_plan_part, v_topup_part, greatest(p_characters, 0), left(p_voice, 40));
  return greatest(coalesce(s.minutes_left, 0) - p_minutes, 0);
end $$;

revoke all on function public.account_summary() from public, anon;
revoke all on function public.record_usage(numeric, int, text) from public, anon;
grant execute on function public.account_summary() to authenticated, service_role;
grant execute on function public.record_usage(numeric, int, text) to authenticated, service_role;
