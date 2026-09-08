-- VI Eats: restaurants table
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  island text not null,
  cuisine text[] not null default '{}',
  price_level text not null default '$',
  rating numeric not null default 0,
  review_count integer not null default 0,
  images jsonb not null default '{"hero": "", "gallery": []}',
  location jsonb not null default '{}',
  contact jsonb not null default '{}',
  hours jsonb not null default '{}',
  features text[] not null default '{}',
  dietary_options text[] not null default '{}',
  menu jsonb not null default '[]',
  is_open boolean not null default true,
  owner_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.restaurants add column if not exists owner_id uuid references auth.users (id) on delete set null;

-- Keep updated_at current on every change.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists restaurants_set_updated_at on public.restaurants;
create trigger restaurants_set_updated_at
  before update on public.restaurants
  for each row execute function public.set_updated_at();

alter table public.restaurants enable row level security;

-- Anyone (including the anon key used by the app) can read restaurant data.
drop policy if exists "Public read access" on public.restaurants;
create policy "Public read access"
  on public.restaurants for select
  using (true);

-- Superseded by owner-scoped policies below now that auth exists.
drop policy if exists "Temporary open write access" on public.restaurants;

-- An owner can only create/edit a restaurant row that points back at them.
-- There's no self-serve "claim a restaurant" flow yet, so owner_id is set
-- manually (see scripts/assign-owner.ts) after an owner creates an account.
drop policy if exists "Owners can insert their own restaurant" on public.restaurants;
create policy "Owners can insert their own restaurant"
  on public.restaurants for insert
  with check (owner_id = auth.uid());

drop policy if exists "Owners can update their own restaurant" on public.restaurants;
create policy "Owners can update their own restaurant"
  on public.restaurants for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create index if not exists restaurants_island_idx on public.restaurants (island);
create index if not exists restaurants_slug_idx on public.restaurants (slug);
create index if not exists restaurants_owner_id_idx on public.restaurants (owner_id);

-- One-off closures/hours overrides (holidays, private events, etc.), separate
-- from the restaurant's regular weekly `hours` since it's naturally a list
-- an owner adds/removes entries from, not a single blob to overwrite.
create table if not exists public.special_hours (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  date date not null,
  reason text not null,
  closed boolean not null default false,
  open_time text,
  close_time text,
  created_at timestamptz not null default now()
);

alter table public.special_hours enable row level security;

-- Anyone can read (a future public restaurant page can show upcoming closures).
drop policy if exists "Public read access" on public.special_hours;
create policy "Public read access"
  on public.special_hours for select
  using (true);

-- Only the restaurant's owner can add/remove entries for it.
drop policy if exists "Owners can insert special hours for their restaurant" on public.special_hours;
create policy "Owners can insert special hours for their restaurant"
  on public.special_hours for insert
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can delete special hours for their restaurant" on public.special_hours;
create policy "Owners can delete special hours for their restaurant"
  on public.special_hours for delete
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

create index if not exists special_hours_restaurant_id_idx on public.special_hours (restaurant_id);
create index if not exists special_hours_date_idx on public.special_hours (date);

-- Customer-submitted corrections (wrong hours, stale menu prices, etc).
-- There's no customer-facing auth yet, so user_id is nullable and anyone can
-- insert; only the restaurant's owner can read or resolve their own reports.
create table if not exists public.user_reports (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  type text not null,
  description text not null,
  photo text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users (id) on delete set null
);

alter table public.user_reports enable row level security;

-- Anyone can file a report about a restaurant (no customer login required).
drop policy if exists "Anyone can submit a report" on public.user_reports;
create policy "Anyone can submit a report"
  on public.user_reports for insert
  with check (true);

-- Only the restaurant's owner can see or resolve reports about it.
drop policy if exists "Owners can view reports for their restaurant" on public.user_reports;
create policy "Owners can view reports for their restaurant"
  on public.user_reports for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can resolve reports for their restaurant" on public.user_reports;
create policy "Owners can resolve reports for their restaurant"
  on public.user_reports for update
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

create index if not exists user_reports_restaurant_id_idx on public.user_reports (restaurant_id);
create index if not exists user_reports_status_idx on public.user_reports (status);

-- Anonymous engagement tracking (profile views, call taps, direction taps)
-- so the admin analytics screen shows real numbers instead of mock data.
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

-- Anyone can log an event (no customer login exists to gate this on).
drop policy if exists "Anyone can log an analytics event" on public.analytics_events;
create policy "Anyone can log an analytics event"
  on public.analytics_events for insert
  with check (true);

-- Only the restaurant's owner can read their own analytics.
drop policy if exists "Owners can view analytics for their restaurant" on public.analytics_events;
create policy "Owners can view analytics for their restaurant"
  on public.analytics_events for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

create index if not exists analytics_events_restaurant_id_idx on public.analytics_events (restaurant_id);
create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at);
