"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { GRADIENTS, gradientFor } from "@/lib/cn";
import { motion } from "framer-motion";
import { Dna, Check } from "lucide-react";

const CATEGORIES = [
  "Consumer App",
  "Developer Tools",
  "Productivity / SaaS",
  "Marketplace",
  "Fintech",
  "AI / ML",
  "Healthcare",
  "Other",
];

export default function NewProductPage() {
  const router = useRouter();
  const { createProduct } = useStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [cover, setCover] = useState("violet");
  const [isPublic, setIsPublic] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const p = createProduct({
      name: name.trim(),
      description: description.trim() || "An evolving product. Its story starts here.",
      category,
      cover,
      accent: ACCENTS[cover] || "#7c5cff",
      isPublic,
      owner: "me",
    });
    router.push(`/products/${p.slug}`);
  }

  return (
    <div className="container max-w-2xl py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-deep">
            <Dna size={20} className="text-white" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New Product Story</h1>
            <p className="text-sm text-ink-muted">Give your product a place to remember its decisions.</p>
          </div>
        </div>

        <form onSubmit={submit} className="card space-y-6 p-7">
          {/* cover preview */}
          <div
            className="relative h-28 overflow-hidden rounded-xl"
            style={{ background: gradientFor(cover) }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-4 text-lg font-semibold">
              {name || "Your product"}
            </div>
          </div>

          <Field label="Name">
            <input
              className="input"
              placeholder="e.g. Acme Analytics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </Field>

          <Field label="Description">
            <textarea
              className="input min-h-[88px] resize-none"
              placeholder="What is this product, in one or two sentences?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Category">
              <select
                className="input appearance-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-bg-elevated">
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Visibility">
              <button
                type="button"
                onClick={() => setIsPublic((v) => !v)}
                className={`input flex items-center justify-between ${isPublic ? "border-brand/50" : ""}`}
              >
                <span>{isPublic ? "Public story" : "Private"}</span>
                <span
                  className={`relative h-5 w-9 rounded-full transition ${
                    isPublic ? "bg-brand" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                      isPublic ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </span>
              </button>
            </Field>
          </div>

          <Field label="Cover">
            <div className="flex flex-wrap gap-2.5">
              {Object.keys(GRADIENTS).map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setCover(g)}
                  className="relative h-11 w-11 rounded-lg ring-2 ring-transparent transition hover:scale-105"
                  style={{ background: gradientFor(g), ...(cover === g ? { boxShadow: "0 0 0 2px #7c5cff" } : {}) }}
                >
                  {cover === g && (
                    <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!name.trim()}>
              Create product
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

const ACCENTS: Record<string, string> = {
  aurora: "#2c5364",
  crimson: "#6f0000",
  sunset: "#734b6d",
  graphite: "#414345",
  violet: "#5b3fd6",
  midnight: "#302b63",
  ember: "#f5af19",
  ocean: "#2193b0",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
