-- FeatureDNA — Supabase schema (optional persistence upgrade path)
-- Run in the Supabase SQL editor. The app works without this (localStorage),
-- but this enables multi-device persistence + auth.

create extension if not exists "uuid-ossp";

-- Profiles ------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  handle text unique,
  display_name text,
  created_at timestamptz default now()
);

-- Products ------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  category text,
  cover text default 'violet',
  accent text default '#7c5cff',
  is_public boolean default false,
  owner uuid references profiles(id) on delete cascade,
  seeded boolean default false,
  created_at timestamptz default now()
);

-- Features (lineage tree via parent_id) -------------------------------------
create table if not exists features (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  parent_id uuid references features(id) on delete set null,
  name text not null,
  summary text,
  status text default 'active', -- active | shipped | killed | experimental
  created_at timestamptz default now()
);

-- Evolution events ----------------------------------------------------------
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  feature_id uuid references features(id) on delete cascade,
  type text not null,         -- idea | research | feedback | ... | kill
  title text not null,
  description text,
  date date not null,
  metrics jsonb default '[]',
  attachments jsonb default '[]',
  alternatives jsonb default '[]',
  lesson text,
  owner text,
  source text default 'manual', -- manual | ai | slack | jira | notion
  created_at timestamptz default now()
);

create index if not exists idx_features_product on features(product_id);
create index if not exists idx_events_feature on events(feature_id);

-- Row Level Security --------------------------------------------------------
alter table products enable row level security;
alter table features enable row level security;
alter table events   enable row level security;

-- Public products are readable by anyone; owners manage their own.
create policy "public products are viewable" on products
  for select using (is_public or owner = auth.uid());
create policy "owners manage their products" on products
  for all using (owner = auth.uid()) with check (owner = auth.uid());

create policy "features of viewable products" on features
  for select using (
    exists (select 1 from products p where p.id = product_id and (p.is_public or p.owner = auth.uid()))
  );
create policy "owners manage features" on features
  for all using (
    exists (select 1 from products p where p.id = product_id and p.owner = auth.uid())
  );

create policy "events of viewable products" on events
  for select using (
    exists (
      select 1 from features f join products p on p.id = f.product_id
      where f.id = feature_id and (p.is_public or p.owner = auth.uid())
    )
  );
create policy "owners manage events" on events
  for all using (
    exists (
      select 1 from features f join products p on p.id = f.product_id
      where f.id = feature_id and p.owner = auth.uid()
    )
  );
