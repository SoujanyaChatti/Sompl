"use client";

import * as Icons from "lucide-react";
import { EVENT_META, EventType, TONE_COLOR } from "@/lib/types";

export function EventIcon({
  type,
  size = 16,
  className,
}: {
  type: EventType;
  size?: number;
  className?: string;
}) {
  const meta = EVENT_META[type];
  const Lucide = (Icons as any)[meta.icon] || Icons.Circle;
  return <Lucide size={size} className={className} style={{ color: TONE_COLOR[meta.tone] }} />;
}

export function eventColor(type: EventType) {
  return TONE_COLOR[EVENT_META[type].tone];
}
