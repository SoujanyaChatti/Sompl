"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { gradientFor } from "@/lib/cn";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Lock, Clock, Network, BookOpen, Plus, Share2, ArrowLeft, X,
} from "lucide-react";
import { CommitBox } from "@/components/CommitBox";
import { Timeline } from "@/components/Timeline";
import { EvolutionGraph } from "@/components/EvolutionGraph";
import { Historian } from "@/components/Historian";
import { TimeMachine } from "@/components/TimeMachine";
import { FeatureStatus, STATUS_META } from "@/lib/types";
import { track } from "@/lib/novus";
import Link from "next/link";

type Tab = "timeline" | "graph" | "story";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { getBundle, togglePublic, addEvent, addFeature, reorderEvents, ready } = useStore();
  const bundle = getBundle(slug);

  const [tab, setTab] = useState<Tab>("timeline");
  const [activeDate, setActiveDate] = useState<Date | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [addingFeature, setAddingFeature] = useState(false);

  const visibleEvents = useMemo(() => {
    if (!bundle) return [];
    let evs = bundle.events;
    if (activeDate) evs = evs.filter((e) => new Date(e.date) <= activeDate);
    if (selectedFeature) evs = evs.filter((e) => e.featureId === selectedFeature);
    return evs;
  }, [bundle, activeDate, selectedFeature]);

  if (!ready) {
    return <div className="container py-24 text-center text-ink-faint">Loading…</div>;
  }
  if (!bundle) {
    return (
      <div className="container py-24 text-center">
        <p className="text-ink-muted">Product not found.</p>
        <Link href="/" className="btn-ghost mt-4 inline-flex">
          <ArrowLeft size={15} /> Back to Museum
        </Link>
      </div>
    );
  }

  const { product, features, events } = bundle;
  const selectedFeatureObj = features.find((f) => f.id === selectedFeature);

  return (
    <div className="pb-24">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0" style={{ background: gradientFor(product.cover), opacity: 0.5 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/70 to-bg" />
        <div className="container relative py-10">
          <button onClick={() => router.back()} className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-muted transition hover:text-ink">
            <ArrowLeft size={15} /> Back
          </button>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2">
                <span className="chip">{product.category}</span>
                {product.seeded && <span className="chip">Museum story</span>}
              </div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{product.name}</h1>
              <p className="mt-3 max-w-xl text-pretty leading-relaxed text-ink-muted">{product.description}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-ink-faint">
                <span>{features.length} features</span>
                <span>·</span>
                <span>{events.length} events</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => togglePublic(product.id)}
                className={product.isPublic ? "btn-primary" : "btn-ghost"}
              >
                {product.isPublic ? <Globe size={15} /> : <Lock size={15} />}
                {product.isPublic ? "Public" : "Make Public"}
              </button>
              {product.isPublic && (
                <Link
                  href={`/story/${product.slug}`}
                  onClick={() => track("public_story_opened", { product: product.slug })}
                  className="btn-ghost"
                >
                  <Share2 size={15} /> View Story
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container grid gap-6 pt-6 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="order-2 lg:order-1">
          {/* tabs */}
          <div className="mb-4 flex items-center gap-1 rounded-xl border border-white/[0.06] bg-bg-card/60 p-1">
            <TabBtn active={tab === "timeline"} onClick={() => { setTab("timeline"); track("tab_changed", { tab: "timeline" }); }} icon={Clock} label="Timeline" />
            <TabBtn active={tab === "graph"} onClick={() => { setTab("graph"); track("tab_changed", { tab: "graph" }); }} icon={Network} label="Evolution Graph" />
            <TabBtn active={tab === "story"} onClick={() => { setTab("story"); track("tab_changed", { tab: "story" }); }} icon={BookOpen} label="AI Story" />
          </div>

          {/* selected-feature filter banner */}
          {selectedFeature && (
            <div className="mb-3 flex items-center justify-between rounded-lg border border-brand/30 bg-brand/[0.06] px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[selectedFeatureObj?.status || "active"].color }} />
                Filtering to <span className="font-medium">{selectedFeatureObj?.name}</span>
              </span>
              <button onClick={() => setSelectedFeature(null)} className="text-ink-faint hover:text-ink">
                <X size={15} />
              </button>
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0.001, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "timeline" && (
                <Timeline
                  events={visibleEvents}
                  features={features}
                  reorderable={Boolean(selectedFeature)}
                  onReorder={(ids) => selectedFeature && reorderEvents(selectedFeature, ids)}
                />
              )}
              {tab === "graph" && (
                <div>
                  <EvolutionGraph
                    features={features}
                    events={events}
                    activeDate={activeDate}
                    onSelect={(fid) => {
                      setSelectedFeature(fid);
                      setTab("timeline");
                    }}
                  />
                  <p className="mt-2 text-center text-xs text-ink-faint">
                    Click a feature to open its timeline. Edges show how features branched and mutated.
                  </p>
                </div>
              )}
              {tab === "story" && <Historian bundle={{ product, features, events: visibleEvents.length ? visibleEvents : events }} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Side column */}
        <div className="order-1 space-y-5 lg:order-2">
          <TimeMachine events={events} value={activeDate} onChange={setActiveDate} />

          <CommitBox
            features={features}
            defaultFeatureId={selectedFeature || features[0]?.id}
            onCommit={(ev) => {
              addEvent(ev);
              setTab("timeline");
            }}
          />

          {/* Features list */}
          <div className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Features</h3>
              <button onClick={() => setAddingFeature((v) => !v)} className="btn-ghost !px-2 !py-1 !text-xs">
                <Plus size={13} /> Add
              </button>
            </div>

            {addingFeature && (
              <AddFeatureForm
                productId={product.id}
                features={features}
                onAdd={(f) => {
                  addFeature(f);
                  setAddingFeature(false);
                }}
              />
            )}

            <div className="space-y-1">
              {features.map((f) => {
                const meta = STATUS_META[f.status];
                const count = events.filter((e) => e.featureId === f.id).length;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFeature(selectedFeature === f.id ? null : f.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition ${
                      selectedFeature === f.id ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: meta.color }} />
                      <span className="truncate">{f.name}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-faint">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? "bg-brand/15 text-ink" : "text-ink-muted hover:text-ink"
      }`}
    >
      <Icon size={15} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function AddFeatureForm({
  productId,
  features,
  onAdd,
}: {
  productId: string;
  features: { id: string; name: string }[];
  onAdd: (f: any) => void;
}) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [status, setStatus] = useState<FeatureStatus>("active");

  return (
    <div className="mb-3 space-y-2 rounded-lg border border-white/[0.06] bg-black/20 p-3">
      <input className="input !py-2 text-sm" placeholder="Feature name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <div className="grid grid-cols-2 gap-2">
        <select className="input !py-2 text-xs" value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="" className="bg-bg-elevated">No parent (root)</option>
          {features.map((f) => (
            <option key={f.id} value={f.id} className="bg-bg-elevated">↳ {f.name}</option>
          ))}
        </select>
        <select className="input !py-2 text-xs" value={status} onChange={(e) => setStatus(e.target.value as FeatureStatus)}>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <option key={k} value={k} className="bg-bg-elevated">{v.label}</option>
          ))}
        </select>
      </div>
      <button
        disabled={!name.trim()}
        onClick={() =>
          onAdd({ productId, parentId: parentId || null, name: name.trim(), summary: "A new branch in the story.", status })
        }
        className="btn-primary !w-full !py-2 !text-sm"
      >
        Add feature
      </button>
    </div>
  );
}
