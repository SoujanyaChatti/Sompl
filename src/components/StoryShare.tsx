"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { track } from "@/lib/novus";

export function StoryShare({ slug, name }: { slug: string; name: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? `${window.location.origin}/story/${slug}` : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: `The evolution of ${name}`, url });
        track("public_story_shared", { product: slug, shareMethod: "native" });
        return;
      }
    } catch {
      /* fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      track("public_story_shared", { product: slug, shareMethod: "clipboard" });
    } catch {
      /* ignore */
    }
  }

  return (
    <button onClick={share} className="btn-ghost !py-1.5 !text-sm">
      {copied ? <Check size={14} className="text-success" /> : <Share2 size={14} />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
