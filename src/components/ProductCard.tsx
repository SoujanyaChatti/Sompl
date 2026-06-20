"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/lib/types";
import { gradientFor } from "@/lib/cn";
import { ArrowUpRight, Globe, Lock } from "lucide-react";

export function ProductCard({
  product,
  index = 0,
  stats,
}: {
  product: Product;
  index?: number;
  stats?: { features: number; events: number };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-white/[0.07] bg-bg-card transition-all duration-300 hover:border-white/[0.16] hover:shadow-2xl hover:shadow-black/40"
      >
        <div
          className="relative h-32 overflow-hidden"
          style={{ background: gradientFor(product.cover) }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:14px_14px]" />
          <div
            className="absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150"
            style={{ background: product.accent, opacity: 0.4 }}
          />
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            {product.isPublic ? (
              <span className="chip !bg-black/30 !py-0.5 backdrop-blur">
                <Globe size={11} /> Public
              </span>
            ) : (
              <span className="chip !bg-black/30 !py-0.5 backdrop-blur">
                <Lock size={11} /> Private
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">{product.name}</h3>
            <ArrowUpRight
              size={18}
              className="text-ink-faint transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-glow"
            />
          </div>
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-ink-muted">
            {product.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-ink-faint">
            <span className="chip !py-0.5">{product.category}</span>
            {stats && (
              <>
                <span>{stats.features} features</span>
                <span className="text-ink-faint/40">·</span>
                <span>{stats.events} events</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
