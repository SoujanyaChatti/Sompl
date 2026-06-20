"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { Dna, GitBranch, Sparkles, ArrowRight, Clock, Network } from "lucide-react";

export default function Home() {
  const { products, getBundle } = useStore();
  const museum = products.filter((p) => p.isPublic);

  return (
    <div className="container pb-24">
      {/* Hero */}
      <section className="relative pt-16 pb-14 text-center sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-ink-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-glow" />
            </span>
            Sompl · the Story Of My Product&apos;s Life
          </div>

          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            <span className="heading-gradient">The Story Of My</span>
            <br />
            <span className="bg-gradient-to-r from-brand-glow via-brand to-info bg-clip-text text-transparent">
              Product&apos;s Life
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-muted">
            Software has Git. Products don&apos;t. Every feature has a birth, growth,
            mutations, successes, and deaths. <span className="text-ink">Sompl</span> captures
            the <em>why</em> — and learns from it.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="#museum" className="btn-primary !px-5 !py-3 text-[15px]">
              Explore the Museum <ArrowRight size={16} />
            </Link>
            <Link href="/products/new" className="btn-ghost !px-5 !py-3 text-[15px]">
              <Dna size={16} /> Start your product&apos;s story
            </Link>
          </div>
        </motion.div>

        {/* feature strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { icon: Clock, label: "Evolution Timeline", sub: "Every event, beautifully" },
            { icon: Network, label: "Lineage Graph", sub: "Features branch & mutate" },
            { icon: Sparkles, label: "AI Historian", sub: "Tell the story" },
            { icon: GitBranch, label: "Time Machine", sub: "Replay the past" },
          ].map((f, i) => (
            <div
              key={i}
              className="card flex flex-col items-center gap-1.5 p-4 text-center"
            >
              <f.icon size={18} className="text-brand-glow" />
              <div className="text-sm font-medium">{f.label}</div>
              <div className="text-[11px] text-ink-faint">{f.sub}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Museum */}
      <section id="museum" className="scroll-mt-20 pt-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Product Museum</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Real evolutionary stories of products you know — including the features they killed.
            </p>
          </div>
          <span className="hidden chip sm:inline-flex">{museum.length} stories</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {museum.map((p, i) => {
            const b = getBundle(p.slug);
            return (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                stats={b ? { features: b.features.length, events: b.events.length } : undefined}
              />
            );
          })}
        </div>
      </section>

      {/* closing line */}
      <section className="mt-24 text-center">
        <p className="mx-auto max-w-2xl text-2xl font-medium leading-snug tracking-tight text-ink-muted">
          Git tracks how the <span className="text-ink">code</span> evolved.
          <br />
          Sompl tracks how the{" "}
          <span className="bg-gradient-to-r from-brand-glow to-info bg-clip-text text-transparent">
            thinking
          </span>{" "}
          evolved.
        </p>
      </section>
    </div>
  );
}
