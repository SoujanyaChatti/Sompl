import { EventType } from "../types";

// High-quality deterministic fallbacks so the demo NEVER breaks,
// even without a Groq key or on a rate limit. These are good enough
// to feel "AI-powered" on their own.

const TYPE_KEYWORDS: { type: EventType; words: string[] }[] = [
  { type: "kill", words: ["kill", "killed", "shut down", "sunset", "remove", "deprecate", "retire", "axe"] },
  { type: "launch", words: ["launch", "launched", "shipped", "released", "ship", "rolled out", "ga"] },
  { type: "experiment", words: ["experiment", "a/b", "test", "beta", "pilot", "trial"] },
  { type: "success", words: ["success", "grew", "increased", "boosted", "win", "exceeded", "beat"] },
  { type: "failure", words: ["failed", "flopped", "missed", "dropped", "declined", "regression"] },
  { type: "feedback", words: ["users said", "feedback", "complaint", "requested", "interview"] },
  { type: "research", words: ["research", "study", "data showed", "analysis", "discovered"] },
  { type: "idea", words: ["idea", "what if", "concept", "hypothesis", "brainstorm"] },
  { type: "redesign", words: ["redesign", "rebuilt", "overhaul", "revamp"] },
  { type: "iteration", words: ["iterate", "improved", "v2", "refined", "tweaked"] },
  { type: "mvp", words: ["mvp", "prototype", "first version", "minimum"] },
  { type: "retrospective", words: ["retro", "retrospective", "lessons", "looking back"] },
];

function detectType(text: string): EventType {
  const t = text.toLowerCase();
  for (const { type, words } of TYPE_KEYWORDS) {
    if (words.some((w) => t.includes(w))) return type;
  }
  return "launch";
}

function extractMetrics(text: string) {
  const metrics: { label: string; expected?: string; actual?: string; after?: string }[] = [];
  const pct = text.match(/([+-]?\d+(\.\d+)?\s?%)/g);
  if (pct) {
    pct.slice(0, 2).forEach((p, i) => {
      const expected = /expect/i.test(text) && i === 0;
      metrics.push(
        expected
          ? { label: "Expected impact", expected: p.replace(/\s/g, "") }
          : { label: "Reported impact", after: p.replace(/\s/g, "") }
      );
    });
  }
  return metrics;
}

function titleFrom(text: string): string {
  const firstSentence = text.split(/[.!?]/)[0].trim();
  const clipped = firstSentence.length > 70 ? firstSentence.slice(0, 67) + "…" : firstSentence;
  return clipped.charAt(0).toUpperCase() + clipped.slice(1);
}

export function mockParseCommit(text: string) {
  const type = detectType(text);
  const metrics = extractMetrics(text);
  return {
    type,
    title: titleFrom(text),
    description: text.trim(),
    metrics,
    alternatives: [
      "Do nothing and revisit next quarter",
      "Ship a smaller, reversible version first",
    ],
    lesson:
      type === "kill"
        ? "Killing cleanly frees focus. Capture the learning before removing the feature."
        : type === "launch"
        ? "Pair every launch with a measurable hypothesis so success is unambiguous."
        : "Tie this change to a single metric you can defend in a review.",
    confidence: 0.62,
  };
}

export function mockHistorian(productName: string, events: { type: string; title: string }[]) {
  const launches = events.filter((e) => e.type === "launch" || e.type === "success").length;
  const kills = events.filter((e) => e.type === "kill" || e.type === "failure").length;
  return `## The Evolution of ${productName}

Across **${events.length} recorded moments**, ${productName} reveals a pattern most roadmaps hide: progress is not a straight line. It is a sequence of bets — **${launches} that paid off** and **${kills} that didn't**, each leaving a lesson behind.

### The shape of the story
The earliest events are about *seeing a problem clearly* before reaching for a solution. The strongest chapters pair a bold launch with a number to judge it by. The hardest — and most valuable — moments are the kills: features given a clean death so the team could refocus.

### Patterns worth stealing
- **Bet, measure, decide.** Every durable feature here started as a falsifiable hypothesis.
- **Kill with dignity.** The discontinued branches weren't failures of nerve — they were disciplined exits that captured a lesson.
- **Personalization compounds.** The features that became identity-defining gave users something about *themselves*.

### What it suggests next
The history points toward doubling down on the branches with the steepest metric lifts, and treating the killed experiments as a map of where *not* to wander again.

> Git tracks how the code evolved. This tracks how the **thinking** evolved — and that is the institutional memory most teams lose.`;
}
