"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, X } from "lucide-react";
import { useEffect, useState } from "react";
import { readActivityLog } from "@/lib/novus";

interface Entry {
  event: string;
  props: Record<string, unknown>;
  ts: number;
}

export function ActivityPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [log, setLog] = useState<Entry[]>([]);

  useEffect(() => {
    const refresh = () => setLog([...readActivityLog()].reverse());
    refresh();
    const handler = () => refresh();
    window.addEventListener("novus:track", handler);
    return () => window.removeEventListener("novus:track", handler);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-bg-elevated"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-brand-glow" />
                <h2 className="font-semibold">Novus Activity</h2>
                <span className="chip !py-0.5">{log.length} events</span>
              </div>
              <button onClick={onClose} className="text-ink-faint hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <p className="border-b border-white/[0.06] px-5 py-3 text-xs text-ink-faint">
              Every interaction below is tracked to Novus.ai — the mandatory analytics layer.
              This live feed proves measurable user interaction.
            </p>
            <div className="flex-1 overflow-y-auto p-3">
              {log.length === 0 ? (
                <div className="grid h-full place-items-center text-center text-sm text-ink-faint">
                  <div>
                    <Activity size={28} className="mx-auto mb-2 opacity-40" />
                    Interact with the app to see Novus events stream in.
                  </div>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {log.map((e, i) => (
                    <motion.li
                      key={`${e.ts}-${i}`}
                      initial={i === 0 ? { opacity: 0, x: 12 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <code className="text-[13px] font-medium text-brand-glow">{e.event}</code>
                        <span className="text-[10px] text-ink-faint">
                          {new Date(e.ts).toLocaleTimeString()}
                        </span>
                      </div>
                      {Object.keys(e.props || {}).length > 0 && (
                        <div className="mt-1 truncate font-mono text-[11px] text-ink-faint">
                          {JSON.stringify(e.props)}
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
