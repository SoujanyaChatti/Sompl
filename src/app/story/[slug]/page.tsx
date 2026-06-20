"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { gradientFor } from "@/lib/cn";
import { motion } from "framer-motion";
import { Timeline } from "@/components/Timeline";
import { EvolutionGraph } from "@/components/EvolutionGraph";
import { Historian } from "@/components/Historian";
import { Dna, ArrowLeft, Sparkles, Award, Skull } from "lucide-react";
import { StoryShare } from "@/components/StoryShare";
import { useEffect } from "react";
import { track } from "@/lib/novus";

export default function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { getBundle, ready } = useStore();
  const bundle = getBundle(slug);

  useEffect(() => {
    if (bundle) track("public_story_viewed", { product: slug });
  }, [bundle, slug]);

  const lessons = useMemo(
    () => bundle?.events.filter((e) => e.lesson).map((e) => ({ lesson: e.lesson!, type: e.type, title: e.title })) ?? [],
    [bundle]
  );

  if (!ready) return <div className="grid h-screen place-items-center text-ink-faint">Loading…</div>;
  if (!bundle || !bundle.product.isPublic) {
    return (
      <div className="grid h-screen place-items-center text-center">
        <div>
          <p className="text-ink-muted">This story isn&apos;t public.</p>
          <Link href="/" className="btn-ghost mt-4 inline-flex"><ArrowLeft size={15} /> Home</Link>
        </div>
      </div>
    );
  }

  const { product, features, events } = bundle;
  const wins = events.filter((e) => e.type === "success" || e.type === "launch").length;
  const kills = events.filter((e) => e.type === "kill" || e.type === "failure").length;

  return (
    <div className="min-h-screen">
      {/* minimal top bar */}
      <div className="sticky top-0 z-30 border-b border-white/[0.06] bg-bg/70 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-deep">
              <Dna size={14} className="text-white" />
            </span>
            Som<span className="text-brand-glow">pl</span>
          </Link>
          <StoryShare slug={product.slug} name={product.name} />
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: gradientFor(product.cover), opacity: 0.6 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/20 via-bg/60 to-bg" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="container relative py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="chip mb-5 !bg-black/30 backdrop-blur">The evolution of</span>
            <h1 className="text-6xl font-semibold tracking-tight sm:text-7xl">{product.name}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-ink-muted">
              {product.description}
            </p>
            <div className="mt-8 flex items-center justify-center gap-8 text-center">
              <Stat value={features.length} label="Features" />
              <Stat value={events.length} label="Decisions" />
              <Stat value={wins} label="Wins" color="#3fb950" />
              <Stat value={kills} label="Killed" color="#f85149" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI NARRATIVE */}
      <section className="container max-w-3xl py-16">
        <SectionHeader icon={Sparkles} eyebrow="AI Historian" title="The story, told by AI" />
        <Historian bundle={bundle} />
      </section>

      {/* TIMELINE */}
      <section className="container max-w-3xl py-10">
        <SectionHeader icon={Sparkles} eyebrow="Chronology" title="Every decision, in order" />
        <Timeline events={events} features={features} />
      </section>

      {/* GRAPH */}
      <section className="container max-w-4xl py-10">
        <SectionHeader icon={Sparkles} eyebrow="Lineage" title="How the features evolved" />
        <EvolutionGraph features={features} events={events} />
      </section>

      {/* LESSONS */}
      {lessons.length > 0 && (
        <section className="container max-w-3xl py-10">
          <SectionHeader icon={Award} eyebrow="What we learned" title="Key lessons" />
          <div className="grid gap-3 sm:grid-cols-2">
            {lessons.map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card relative overflow-hidden p-4"
              >
                <div className="absolute -right-3 -top-3 opacity-10">
                  {l.type === "kill" || l.type === "failure" ? <Skull size={48} /> : <Award size={48} />}
                </div>
                <p className="relative text-sm leading-relaxed text-ink">{l.lesson}</p>
                <p className="relative mt-2 text-[11px] text-ink-faint">from “{l.title}”</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container py-20 text-center">
        <p className="mx-auto max-w-xl text-2xl font-medium tracking-tight text-ink-muted">
          Git tracks how the code evolved.
          <br />
          <span className="bg-gradient-to-r from-brand-glow to-info bg-clip-text text-transparent">
            Sompl tracks how the thinking evolved.
          </span>
        </p>
        <Link href="/" className="btn-primary mt-7 inline-flex">
          <Dna size={16} /> Build your own product story
        </Link>
      </section>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-ink-faint">
        Made with Sompl · The Story Of My Product&apos;s Life
      </footer>
    </div>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <div>
      <div className="text-3xl font-semibold tracking-tight" style={{ color: color || "#ECECF1" }}>
        {value}
      </div>
      <div className="text-xs text-ink-faint">{label}</div>
    </div>
  );
}

function SectionHeader({ icon: Icon, eyebrow, title }: { icon: any; eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-wider text-brand-glow">
        <Icon size={12} /> {eyebrow}
      </div>
      <h2 className="text-center text-2xl font-semibold tracking-tight">{title}</h2>
    </div>
  );
}
