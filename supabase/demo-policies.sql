-- Sompl — DEMO RLS policies (anon read + write, no auth required)
-- Run this AFTER schema.sql. It lets the public anon key seed and write,
-- which is what the hackathon demo needs (there is no login flow).
-- For a production app you'd keep the owner-scoped policies in schema.sql instead.

-- Drop the auth-scoped policies from schema.sql (ignore errors if absent).
drop policy if exists "public products are viewable" on products;
drop policy if exists "owners manage their products" on products;
drop policy if exists "features of viewable products" on features;
drop policy if exists "owners manage features" on features;
drop policy if exists "events of viewable products" on events;
drop policy if exists "owners manage events" on events;

-- Make the FK to profiles optional for anon demo inserts.
alter table products alter column owner drop not null;

-- Permissive demo policies: anyone (anon) can read and write.
create policy "demo products read"  on products for select using (true);
create policy "demo products write" on products for insert with check (true);
create policy "demo products update" on products for update using (true) with check (true);

create policy "demo features read"  on features for select using (true);
create policy "demo features write" on features for insert with check (true);
create policy "demo features update" on features for update using (true) with check (true);

create policy "demo events read"  on events for select using (true);
create policy "demo events write" on events for insert with check (true);
create policy "demo events update" on events for update using (true) with check (true);

-- Allow deletes too (lets the app/owner remove rows; also enables cleanup).
create policy "demo products delete" on products for delete using (true);
create policy "demo features delete" on features for delete using (true);
create policy "demo events delete"   on events   for delete using (true);
