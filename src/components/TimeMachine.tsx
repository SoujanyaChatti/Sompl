"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { History, Play, Pause, RotateCcw } from "lucide-react";
import { EvolutionEvent } from "@/lib/types";
import { format } from "date-fns";
import { track } from "@/lib/novus";

export function TimeMachine({
  events,
  value,
  onChange,
}: {
  events: EvolutionEvent[];
  value: Date | null;
  onChange: (d: Date | null) => void;
}) {
  const dates = useMemo(
    () => events.map((e) => +new Date(e.date)).sort((a, b) => a - b),
    [events]
  );
  const min = dates[0] ?? Date.now();
  const max = dates[dates.length - 1] ?? Date.now();

  const [pos, setPos] = useState(100); // percent
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);

  const current = useMemo(() => min + ((max - min) * pos) / 100, [min, max, pos]);

  useEffect(() => {
    // sync external -> only when at 100 we mean "live/all"
    if (pos >= 100) onChange(null);
    else onChange(new Date(current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos]);

  useEffect(() => {
    if (!playing) return;
    track("time_machine_replay", {
      totalEventCount: events.length,
      startPosition: pos,
    });
    const step = () => {
      setPos((p) => {
        if (p >= 100) {
          setPlaying(false);
          return 100;
        }
        return Math.min(100, p + 0.7);
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing]);

  const visibleCount = events.filter((e) => +new Date(e.date) <= current).length;

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={15} className="text-brand-glow" />
          <span className="text-sm font-semibold">Time Machine</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip !py-0.5 !text-[11px]">
            {pos >= 100 ? "Present" : format(new Date(current), "MMM yyyy")}
          </span>
          <span className="text-[11px] text-ink-faint">{visibleCount}/{events.length}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (pos >= 100) setPos(0);
            setPlaying((p) => !p);
            track("time_machine_used", {
              action: playing ? "pause" : "play",
              position: pos,
              visibleEventCount: visibleCount,
              totalEventCount: events.length,
            });
          }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand-glow transition hover:bg-brand/25"
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>

        <div className="relative flex-1">
          {/* track */}
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
          <motion.div
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand to-brand-glow"
            style={{ width: `${pos}%` }}
          />
          {/* event ticks */}
          {dates.map((d, i) => {
            const p = max === min ? 0 : ((d - min) / (max - min)) * 100;
            return (
              <span
                key={i}
                className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: `${p}%`,
                  background: d <= current ? "#9d83ff" : "rgba(255,255,255,0.2)",
                }}
              />
            );
          })}
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={pos}
            onChange={(e) => {
              setPlaying(false);
              setPos(Number(e.target.value));
            }}
            onMouseUp={() => track("time_machine_used", {
              action: "scrub",
              position: pos,
              visibleEventCount: visibleCount,
              totalEventCount: events.length,
            })}
            className="relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-brand/50 [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-brand"
          />
        </div>

        <button
          onClick={() => {
            setPlaying(false);
            setPos(100);
          }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.06] text-ink-faint transition hover:text-ink"
          title="Reset to present"
        >
          <RotateCcw size={14} />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-ink-faint">
        Drag to rewind, or press play to replay the product&apos;s evolution.
      </p>
    </div>
  );
}
