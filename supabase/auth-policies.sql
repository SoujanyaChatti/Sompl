-- Sompl — AUTH RLS policies (run AFTER schema.sql, REPLACES demo-policies.sql)

-- 0) Clean up any anonymous/test products created under the old open policies.
--    (Runs as table owner here, bypassing RLS.) Removes everything not seeded.
delete from products where seeded = false;

-- Model:
--   • Anyone (anon) can READ public products + the seeded museum.
--   • Logged-in users can CREATE products (owner = themselves).
--   • Users can UPDATE/DELETE only their OWN products (and their features/events).
--   • Seeded museum products are read-only to everyone (owner is null).

-- Drop the permissive demo policies if present.
drop policy if exists "demo products read"   on products;
drop policy if exists "demo products write"  on products;
drop policy if exists "demo products update" on products;
drop policy if exists "demo products delete" on products;
drop policy if exists "demo features read"   on features;
drop policy if exists "demo features write"  on features;
drop policy if exists "demo features update" on features;
drop policy if exists "demo features delete" on features;
drop policy if exists "demo events read"   on events;
drop policy if exists "demo events write"  on events;
drop policy if exists "demo events update" on events;
drop policy if exists "demo events delete" on events;
-- Drop the original owner-scoped ones from schema.sql too (we recreate them).
drop policy if exists "public products are viewable" on products;
drop policy if exists "owners manage their products" on products;
drop policy if exists "features of viewable products" on features;
drop policy if exists "owners manage features" on features;
drop policy if exists "events of viewable products" on events;
drop policy if exists "owners manage events" on events;

-- ── PROFILES ────────────────────────────────────────────────────────────────
alter table profiles enable row level security;
drop policy if exists "profiles readable" on profiles;
drop policy if exists "users upsert own profile" on profiles;
create policy "profiles readable" on profiles for select using (true);
create policy "users upsert own profile" on profiles
  for insert with check (id = auth.uid());
create policy "users update own profile" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ── PRODUCTS ────────────────────────────────────────────────────────────────
create policy "read public or own products" on products
  for select using (is_public or owner = auth.uid());
create policy "auth users create products" on products
  for insert with check (auth.uid() is not null and owner = auth.uid());
create policy "owners update products" on products
  for update using (owner = auth.uid()) with check (owner = auth.uid());
create policy "owners delete products" on products
  for delete using (owner = auth.uid());

-- ── FEATURES ────────────────────────────────────────────────────────────────
create policy "read features of visible products" on features
  for select using (
    exists (select 1 from products p where p.id = product_id and (p.is_public or p.owner = auth.uid()))
  );
create policy "owners insert features" on features
  for insert with check (
    exists (select 1 from products p where p.id = product_id and p.owner = auth.uid())
  );
create policy "owners update features" on features
  for update using (
    exists (select 1 from products p where p.id = product_id and p.owner = auth.uid())
  );
create policy "owners delete features" on features
  for delete using (
    exists (select 1 from products p where p.id = product_id and p.owner = auth.uid())
  );

-- ── EVENTS ──────────────────────────────────────────────────────────────────
create policy "read events of visible products" on events
  for select using (
    exists (
      select 1 from features f join products p on p.id = f.product_id
      where f.id = feature_id and (p.is_public or p.owner = auth.uid())
    )
  );
create policy "owners insert events" on events
  for insert with check (
    exists (
      select 1 from features f join products p on p.id = f.product_id
      where f.id = feature_id and p.owner = auth.uid()
    )
  );
create policy "owners update events" on events
  for update using (
    exists (
      select 1 from features f join products p on p.id = f.product_id
      where f.id = feature_id and p.owner = auth.uid()
    )
  );
create policy "owners delete events" on events
  for delete using (
    exists (
      select 1 from features f join products p on p.id = f.product_id
      where f.id = feature_id and p.owner = auth.uid()
    )
  );

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, handle, display_name)
  values (new.id, split_part(new.email, '@', 1), split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
