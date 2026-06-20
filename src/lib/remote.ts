import { supabase } from "./supabase";
import { Product, Feature, EvolutionEvent, ProductBundle } from "./types";
import { SEED_BUNDLES } from "./seed";

// Remote (Supabase) data layer. All functions no-op / return null when
// Supabase isn't configured so callers can fall back to localStorage.

// ── row <-> app mappers ────────────────────────────────────────────────────
function rowToProduct(r: any): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? "",
    category: r.category ?? "",
    cover: r.cover ?? "violet",
    accent: r.accent ?? "#7c5cff",
    isPublic: !!r.is_public,
    owner: r.owner ?? "museum",
    seeded: !!r.seeded,
  };
}
function rowToFeature(r: any): Feature {
  return {
    id: r.id,
    productId: r.product_id,
    parentId: r.parent_id ?? null,
    name: r.name,
    summary: r.summary ?? "",
    status: r.status ?? "active",
  };
}
function rowToEvent(r: any): EvolutionEvent {
  return {
    id: r.id,
    featureId: r.feature_id,
    type: r.type,
    title: r.title,
    description: r.description ?? "",
    date: typeof r.date === "string" ? r.date.slice(0, 10) : r.date,
    metrics: r.metrics ?? [],
    attachments: r.attachments ?? [],
    alternatives: r.alternatives ?? [],
    lesson: r.lesson ?? undefined,
    owner: r.owner ?? undefined,
    source: r.source ?? "manual",
  };
}

// ── reads ──────────────────────────────────────────────────────────────────
export async function fetchAll(): Promise<{
  products: Product[];
  features: Feature[];
  events: EvolutionEvent[];
} | null> {
  const sb = supabase();
  if (!sb) return null;
  const [{ data: p, error: pe }, { data: f }, { data: e }] = await Promise.all([
    sb.from("products").select("*").order("created_at", { ascending: false }),
    sb.from("features").select("*"),
    sb.from("events").select("*").order("date", { ascending: true }),
  ]);
  if (pe) throw pe;
  return {
    products: (p ?? []).map(rowToProduct),
    features: (f ?? []).map(rowToFeature),
    events: (e ?? []).map(rowToEvent),
  };
}

// ── writes ─────────────────────────────────────────────────────────────────
export async function insertProduct(p: {
  slug: string;
  name: string;
  description: string;
  category: string;
  cover: string;
  accent: string;
  isPublic: boolean;
  owner: string;
  seeded?: boolean;
}): Promise<Product | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("products")
    .insert({
      slug: p.slug,
      name: p.name,
      description: p.description,
      category: p.category,
      cover: p.cover,
      accent: p.accent,
      is_public: p.isPublic,
      owner: null, // anon demo; owner FK is nullable in practice
      seeded: p.seeded ?? false,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToProduct(data);
}

export async function updateProductPublic(id: string, isPublic: boolean) {
  const sb = supabase();
  if (!sb) return;
  const { error } = await sb.from("products").update({ is_public: isPublic }).eq("id", id);
  if (error) throw error;
}

export async function insertFeature(f: {
  productId: string;
  parentId: string | null;
  name: string;
  summary: string;
  status: string;
}): Promise<Feature | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("features")
    .insert({
      product_id: f.productId,
      parent_id: f.parentId,
      name: f.name,
      summary: f.summary,
      status: f.status,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToFeature(data);
}

export async function insertEvent(ev: Omit<EvolutionEvent, "id">): Promise<EvolutionEvent | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("events")
    .insert({
      feature_id: ev.featureId,
      type: ev.type,
      title: ev.title,
      description: ev.description,
      date: ev.date,
      metrics: ev.metrics ?? [],
      attachments: ev.attachments ?? [],
      alternatives: ev.alternatives ?? [],
      lesson: ev.lesson ?? null,
      owner: ev.owner ?? null,
      source: ev.source ?? "manual",
    })
    .select()
    .single();
  if (error) throw error;
  return rowToEvent(data);
}

// ── idempotent museum seeding ───────────────────────────────────────────────
// Seeds the 6 famous products into Supabase exactly once (keyed by slug).
// Safe to call on every load: if products already exist, it returns early.
export async function ensureSeeded(): Promise<boolean> {
  const sb = supabase();
  if (!sb) return false;

  const { count, error } = await sb
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("seeded", true);
  if (error) throw error;
  if ((count ?? 0) > 0) return true; // already seeded

  // Insert products, then features (remapping parent ids), then events.
  for (const bundle of SEED_BUNDLES) {
    const prod = await insertProduct({
      slug: bundle.product.slug,
      name: bundle.product.name,
      description: bundle.product.description,
      category: bundle.product.category,
      cover: bundle.product.cover,
      accent: bundle.product.accent,
      isPublic: bundle.product.isPublic,
      owner: "museum",
      seeded: true,
    });
    if (!prod) continue;

    // map seed-feature-id -> new db feature id, in parent-before-child order
    const idMap = new Map<string, string>();
    const ordered = [...bundle.features].sort((a, b) => {
      // roots first
      if (!a.parentId && b.parentId) return -1;
      if (a.parentId && !b.parentId) return 1;
      return 0;
    });
    for (const f of ordered) {
      const dbParent = f.parentId ? idMap.get(f.parentId) ?? null : null;
      const created = await insertFeature({
        productId: prod.id,
        parentId: dbParent,
        name: f.name,
        summary: f.summary,
        status: f.status,
      });
      if (created) idMap.set(f.id, created.id);
    }

    for (const e of bundle.events) {
      const dbFeature = idMap.get(e.featureId);
      if (!dbFeature) continue;
      await insertEvent({ ...e, featureId: dbFeature });
    }
  }
  return true;
}
