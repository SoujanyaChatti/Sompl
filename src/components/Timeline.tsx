"use client";

import { useState } from "react";
import { Reorder, motion } from "framer-motion";
import { EvolutionEvent, Feature, EVENT_META } from "@/lib/types";
import { EventIcon, eventColor } from "./EventIcon";
import { format } from "date-fns";
import { GripVertical, User, Sparkles, Slack, FileText, BookText } from "lucide-react";
import { track } from "@/lib/novus";

const SOURCE_ICON = {
  ai: Sparkles,
  slack: Slack,
  jira: FileText,
  notion: BookText,
  manual: User,
};

export function Timeline({
  events,
  features,
  reorderable = false,
  onReorder,
}: {
  events: EvolutionEvent[];
  features: Feature[];
  reorderable?: boolean;
  onReorder?: (orderedIds: string[]) => void;
}) {
  const featureName = (id: string) => features.find((f) => f.id === id)?.name ?? "";

  if (events.length === 0) {
    return (
      <div className="card grid place-items-center px-6 py-16 text-center">
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand/10">
          <Sparkles size={22} className="text-brand-glow" />
        </div>
        <h3 className="font-semibold">The story starts here</h3>
        <p className="mt-1 max-w-xs text-sm text-ink-muted">
          Use the Smart Commit box above to add your first event. Try: &quot;We launched X
          because…&quot;
        </p>
      </div>
    );
  }

  // Reorder only works within a single feature for sane semantics; if mixed, render static.
  const singleFeature = new Set(events.map((e) => e.featureId)).size === 1;
  const canReorder = reorderable && singleFeature;

  if (canReorder) {
    return (
      <Reorder.Group
        axis="y"
        values={events.map((e) => e.id)}
        onReorder={(ids) => {
          onReorder?.(ids as string[]);
          track("timeline_reordered", { featureId: events[0]?.featureId });
        }}
        className="relative space-y-3 pl-1"
      >
        {events.map((e) => (
          <Reorder.Item key={e.id} value={e.id} className="list-none">
            <EventRow ev={e} featureName={featureName(e.featureId)} draggable />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    );
  }

  return (
    <div className="relative">
      <div className="absolute bottom-2 left-[19px] top-2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div className="space-y-3">
        {events.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0.001, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.4) }}
          >
            <EventRow ev={e} featureName={featureName(e.featureId)} showConnector />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EventRow({
  ev,
  featureName,
  draggable,
  showConnector,
}: {
  ev: EvolutionEvent;
  featureName: string;
  draggable?: boolean;
  showConnector?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const color = eventColor(ev.type);
  const SourceIcon = SOURCE_ICON[ev.source || "manual"];
  const hasDetails = (ev.metrics?.length || 0) > 0 || ev.lesson || (ev.alternatives?.length || 0) > 0;

  return (
    <div className="group relative flex gap-3">
      {/* node */}
      <div className="relative z-10 shrink-0">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl border transition group-hover:scale-105"
          style={{ borderColor: `${color}40`, background: `${color}14` }}
        >
          <EventIcon type={ev.type} size={17} />
        </div>
      </div>

      {/* card */}
      <div
        className="flex-1 rounded-xl border border-white/[0.06] bg-bg-card/70 p-3.5 transition hover:border-white/[0.12]"
        onClick={() => hasDetails && setOpen((o) => !o)}
        style={{ cursor: hasDetails ? "pointer" : "default" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ color, background: `${color}1a` }}
              >
                {EVENT_META[ev.type].label}
              </span>
              <span className="text-[11px] text-ink-faint">{format(new Date(ev.date), "MMM d, yyyy")}</span>
              {featureName && (
                <span className="text-[11px] text-ink-faint">· {featureName}</span>
              )}
            </div>
            <h4 className="mt-1.5 font-semibold leading-snug">{ev.title}</h4>
            <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">
              {ev.description}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span title={`source: ${ev.source}`} className="text-ink-faint">
              <SourceIcon size={13} />
            </span>
            {draggable && (
              <GripVertical
                size={15}
                className="cursor-grab text-ink-faint opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
              />
            )}
          </div>
        </div>

        {/* metric chips (always show a hint) */}
        {(ev.metrics?.length || 0) > 0 && !open && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {ev.metrics!.slice(0, 3).map((m, i) => (
              <span key={i} className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-ink-muted">
                {m.label}: <span className="text-ink">{m.before ?? m.expected ?? "?"} → {m.after ?? m.actual ?? "?"}</span>
              </span>
            ))}
          </div>
        )}

        {/* expanded */}
        {open && hasDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 space-y-3 border-t border-white/[0.06] pt-3"
          >
            {(ev.metrics?.length || 0) > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {ev.metrics!.map((m, i) => (
                  <div key={i} className="rounded-lg border border-white/[0.06] bg-black/20 p-2.5">
                    <div className="text-[11px] text-ink-faint">{m.label}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-sm">
                      <span className="text-ink-muted">{m.before ?? m.expected ?? "—"}</span>
                      <span className="text-ink-faint">→</span>
                      <span className="font-semibold" style={{ color }}>
                        {m.after ?? m.actual ?? "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {ev.lesson && (
              <div className="rounded-lg border-l-2 border-warn/60 bg-warn/[0.06] px-3 py-2 text-xs text-ink-muted">
                <span className="font-medium text-warn">Lesson · </span>
                {ev.lesson}
              </div>
            )}
            {(ev.alternatives?.length || 0) > 0 && (
              <div>
                <div className="mb-1 text-[11px] font-medium text-ink-faint">Paths not taken</div>
                <ul className="space-y-1">
                  {ev.alternatives!.map((a, i) => (
                    <li key={i} className="flex gap-1.5 text-xs text-ink-muted">
                      <span className="text-ink-faint">○</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ev.owner && (
              <div className="flex items-center gap-1.5 text-[11px] text-ink-faint">
                <User size={11} /> {ev.owner}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
