-- More generous plans: Free 60, Starter 300, Creator 1,000 minutes a month.
create or replace function public.plan_minutes(p_plan text) returns numeric
language sql immutable as $$
  select case p_plan when 'starter' then 300 when 'creator' then 1000 else 60 end::numeric
$$;
