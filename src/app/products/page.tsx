"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { Plus, FolderGit2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductsPage() {
  const { products, getBundle, ready } = useStore();
  const mine = products.filter((p) => !p.seeded);

  return (
    <div className="container py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My Products</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Your product stories. Build the evolutionary record your team keeps losing.
          </p>
        </div>
        <Link href="/products/new" className="btn-primary">
          <Plus size={16} /> New Product
        </Link>
      </div>

      {ready && mine.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card grid place-items-center px-6 py-20 text-center"
        >
          <FolderGit2 size={36} className="mb-4 text-brand-glow opacity-70" />
          <h3 className="text-lg font-semibold">No products yet</h3>
          <p className="mt-1 max-w-sm text-sm text-ink-muted">
            Start with your own product, or fork one from the Museum. Every great feature
            deserves a recorded history.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/products/new" className="btn-primary">
              <Plus size={16} /> Create your first product
            </Link>
            <Link href="/" className="btn-ghost">
              Browse the Museum
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mine.map((p, i) => {
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
      )}
    </div>
  );
}
