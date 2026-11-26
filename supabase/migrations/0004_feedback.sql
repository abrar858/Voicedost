-- Feedback from the website's "Send feedback" form. Anyone can send;
-- nobody can read it through the API (read it in the Supabase dashboard).
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  message text not null check (char_length(message) between 2 and 2000),
  contact text check (contact is null or char_length(contact) <= 200),
  page text check (page is null or char_length(page) <= 200),
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
grant insert on public.feedback to anon, authenticated;
drop policy if exists "anyone can send feedback" on public.feedback;
create policy "anyone can send feedback" on public.feedback for insert to anon, authenticated with check (true);
