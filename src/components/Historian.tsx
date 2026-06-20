"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, BookOpen, RefreshCw } from "lucide-react";
import { ProductBundle } from "@/lib/types";
import { track } from "@/lib/novus";

export function Historian({ bundle }: { bundle: ProductBundle }) {
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function tellStory() {
    const isRegeneration = done;
    const startTime = Date.now();
    setLoading(true);
    setStory("");
    setDone(false);
    track("historian_generation_started", {
      product: bundle.product.name,
      events: bundle.events.length,
      isRegeneration,
    });

    try {
      const res = await fetch("/api/historian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: bundle.product.name,
          events: bundle.events.map((e) => ({
            type: e.type,
            date: e.date,
            title: e.title,
            description: e.description,
            metrics: e.metrics,
            lesson: e.lesson,
          })),
        }),
      });

      if (!res.body) {
        setStory("Unable to generate story.");
        setLoading(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done: d, value } = await reader.read();
        if (d) break;
        acc += decoder.decode(value, { stream: true });
        setStory(acc);
      }
      setDone(true);
      track("historian_generation_completed", {
        product: bundle.product.name,
        chars: acc.length,
        streamDurationMs: Date.now() - startTime,
      });
    } catch (err) {
      setStory("Unable to generate story right now.");
      track("historian_generation_failed", {
        product: bundle.product.name,
        eventCount: bundle.events.length,
        errorMessage: (err instanceof Error ? err.message : "unknown").substring(0, 100),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-gradient-to-r from-info/[0.06] to-transparent px-5 py-3.5">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-info" />
          <h3 className="text-sm font-semibold">AI Historian</h3>
        </div>
        {story && !loading && (
          <button onClick={tellStory} className="btn-ghost !py-1.5 !text-xs">
            <RefreshCw size={13} /> Regenerate
          </button>
        )}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {!story && !loading ? (
            <motion.div
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid place-items-center py-8 text-center"
            >
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-info/10">
                <Sparkles size={22} className="text-info" />
              </div>
              <h4 className="font-semibold">Tell the story of {bundle.product.name}</h4>
              <p className="mt-1 max-w-sm text-sm text-ink-muted">
                Let the AI Historian read the entire timeline and write the narrative — the arc,
                the patterns, the killed branches, and what to do next.
              </p>
              <button onClick={tellStory} className="btn-primary mt-5">
                <Sparkles size={15} /> Tell the Story
              </button>
            </motion.div>
          ) : (
            <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {loading && story === "" && (
                <div className="flex items-center gap-2 text-sm text-ink-muted">
                  <Loader2 size={15} className="animate-spin text-info" /> Reading the timeline…
                </div>
              )}
              <div className="prose-dna max-w-none">
                <ReactMarkdown>{story}</ReactMarkdown>
                {loading && (
                  <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-info align-middle" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
