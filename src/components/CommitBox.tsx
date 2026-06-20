"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Check, X, Wand2, Slack, FileText, BookText } from "lucide-react";
import { EventType, EvolutionEvent, Feature, EVENT_META } from "@/lib/types";
import { EventIcon } from "./EventIcon";
import { track } from "@/lib/novus";

interface Parsed {
  type: EventType;
  title: string;
  description: string;
  metrics?: { label: string; before?: string; after?: string; expected?: string; actual?: string }[];
  alternatives?: string[];
  lesson?: string;
  mocked?: boolean;
}

const EXAMPLES = [
  "We launched AI Search because users couldn't find old conversations. Expected +15% search usage.",
  "Killed the social tab — only 3% of DAU used it and it cannibalized the home nav.",
  "Ran an A/B test on the new onboarding. Activation went from 41% to 52%.",
];

const PASTE_SOURCES = [
  { id: "slack", icon: Slack, label: "Slack thread", sample: "Paste a Slack thread — we'll extract the decision + metrics." },
  { id: "jira", icon: FileText, label: "Jira ticket", sample: "Paste a Jira ticket — we'll turn it into a structured event." },
  { id: "notion", icon: BookText, label: "Notion doc", sample: "Paste a Notion doc URL or text — enriched into the timeline." },
];

export function CommitBox({
  features,
  defaultFeatureId,
  onCommit,
}: {
  features: Feature[];
  defaultFeatureId?: string;
  onCommit: (ev: Omit<EvolutionEvent, "id">) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [featureId, setFeatureId] = useState(defaultFeatureId || features[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState<EvolutionEvent["source"]>("ai");

  async function parse() {
    if (!text.trim()) return;
    setLoading(true);
    track("ai_parse_started", { length: text.length });
    try {
      const res = await fetch("/api/parse-commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as Parsed;
      setParsed(data);
      track("ai_parse_completed", { type: data.type, mocked: data.mocked });
    } catch {
      /* swallow */
    } finally {
      setLoading(false);
    }
  }

  function confirm() {
    if (!parsed || !featureId) return;
    onCommit({
      featureId,
      type: parsed.type,
      title: parsed.title,
      description: parsed.description,
      date,
      metrics: parsed.metrics,
      alternatives: parsed.alternatives,
      lesson: parsed.lesson,
      source,
    });
    setParsed(null);
    setText("");
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-white/[0.06] bg-gradient-to-r from-brand/[0.08] to-transparent px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Wand2 size={16} className="text-brand-glow" />
          <h3 className="text-sm font-semibold">Smart Commit</h3>
          <span className="chip !py-0.5 !text-[10px]">AI-powered</span>
        </div>
        <p className="mt-0.5 text-xs text-ink-faint">
          Describe what happened in plain English. We&apos;ll structure it, suggest metrics, and surface the lesson.
        </p>
      </div>

      <div className="p-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") parse();
          }}
          placeholder="We launched AI Search because users couldn't find old conversations. Expected +15% search usage…"
          className="input min-h-[90px] resize-none text-[15px] leading-relaxed"
        />

        {!parsed && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setText(ex)}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] text-ink-faint transition hover:border-brand/40 hover:text-ink-muted"
              >
                {ex.slice(0, 42)}…
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {PASTE_SOURCES.map((s) => (
              <button
                key={s.id}
                title={s.sample}
                onClick={() => {
                  setText(s.sample);
                  setSource(s.id as EvolutionEvent["source"]);
                  track("paste_source_clicked", { source: s.id });
                }}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.06] text-ink-faint transition hover:border-brand/40 hover:text-ink-muted"
              >
                <s.icon size={14} />
              </button>
            ))}
          </div>
          <button onClick={parse} disabled={loading || !text.trim()} className="btn-primary">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {loading ? "Parsing…" : "Parse with AI"}
          </button>
        </div>

        {/* Parsed preview */}
        <AnimatePresence>
          {parsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 overflow-hidden"
            >
              <div className="rounded-xl border border-brand/30 bg-brand/[0.05] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-brand-glow">
                    <Sparkles size={12} /> AI suggestion
                    {parsed.mocked && <span className="chip !py-0 !text-[9px]">offline mode</span>}
                  </span>
                  <button onClick={() => setParsed(null)} className="text-ink-faint hover:text-ink">
                    <X size={15} />
                  </button>
                </div>

                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <EventIcon type={parsed.type} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="chip !py-0.5">{EVENT_META[parsed.type].label}</span>
                    </div>
                    <h4 className="mt-1.5 font-semibold">{parsed.title}</h4>
                    <p className="mt-1 text-sm text-ink-muted">{parsed.description}</p>

                    {parsed.metrics && parsed.metrics.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {parsed.metrics.map((m, i) => (
                          <div key={i} className="rounded-lg border border-white/[0.08] bg-black/20 px-2.5 py-1.5 text-xs">
                            <span className="text-ink-faint">{m.label}: </span>
                            <span className="font-medium text-ink">
                              {m.before ?? m.expected ?? "?"} → {m.after ?? m.actual ?? "?"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {parsed.lesson && (
                      <div className="mt-3 rounded-lg border-l-2 border-warn/60 bg-warn/[0.06] px-3 py-2 text-xs text-ink-muted">
                        <span className="font-medium text-warn">Lesson · </span>
                        {parsed.lesson}
                      </div>
                    )}
                  </div>
                </div>

                {/* assignment controls */}
                <div className="mt-4 grid gap-3 border-t border-white/[0.06] pt-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-medium text-ink-faint">Feature</span>
                    <select
                      className="input !py-2 text-sm"
                      value={featureId}
                      onChange={(e) => setFeatureId(e.target.value)}
                    >
                      {features.map((f) => (
                        <option key={f.id} value={f.id} className="bg-bg-elevated">
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-medium text-ink-faint">Date</span>
                    <input
                      type="date"
                      className="input !py-2 text-sm"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </label>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setParsed(null)} className="btn-ghost !py-2">
                    Discard
                  </button>
                  <button onClick={confirm} className="btn-primary !py-2" disabled={!featureId}>
                    <Check size={15} /> Add to timeline
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
