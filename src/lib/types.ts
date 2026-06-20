// ── FeatureDNA domain model ──────────────────────────────────────────────

export type EventType =
  | "idea"
  | "research"
  | "feedback"
  | "prd"
  | "experiment"
  | "mvp"
  | "launch"
  | "iteration"
  | "redesign"
  | "success"
  | "failure"
  | "retrospective"
  | "deprecation"
  | "kill";

export type FeatureStatus = "active" | "shipped" | "killed" | "experimental";

export interface Metric {
  label: string;
  before?: string;
  after?: string;
  /** "expected" vs "actual" framing, optional */
  expected?: string;
  actual?: string;
}

export interface Attachment {
  type: "image" | "link";
  url: string;
  label?: string;
}

export interface EvolutionEvent {
  id: string;
  featureId: string;
  type: EventType;
  title: string;
  description: string;
  date: string; // ISO date
  metrics?: Metric[];
  attachments?: Attachment[];
  owner?: string;
  /** Alternatives / paths-not-taken surfaced by the AI */
  alternatives?: string[];
  /** Lessons extracted by the AI */
  lesson?: string;
  /** Where this came from: manual, ai, slack, jira, notion */
  source?: "manual" | "ai" | "slack" | "jira" | "notion";
}

export interface Feature {
  id: string;
  productId: string;
  /** parent feature id, for the lineage tree (null = root mutation) */
  parentId: string | null;
  name: string;
  summary: string;
  status: FeatureStatus;
  /** graph position hint */
  branch?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  cover: string; // gradient key or image url
  accent: string; // hex
  isPublic: boolean;
  owner: string;
  seeded?: boolean;
}

export interface ProductBundle {
  product: Product;
  features: Feature[];
  events: EvolutionEvent[];
}

// ── Event type presentation metadata ─────────────────────────────────────

export interface EventMeta {
  label: string;
  icon: string; // lucide icon name
  tone: "neutral" | "positive" | "negative" | "info" | "warn";
}

export const EVENT_META: Record<EventType, EventMeta> = {
  idea: { label: "Idea", icon: "Lightbulb", tone: "info" },
  research: { label: "Research", icon: "Microscope", tone: "neutral" },
  feedback: { label: "User Feedback", icon: "MessageSquare", tone: "neutral" },
  prd: { label: "PRD", icon: "FileText", tone: "neutral" },
  experiment: { label: "Experiment", icon: "FlaskConical", tone: "warn" },
  mvp: { label: "MVP", icon: "Rocket", tone: "info" },
  launch: { label: "Launch", icon: "Sparkles", tone: "positive" },
  iteration: { label: "Iteration", icon: "GitBranch", tone: "neutral" },
  redesign: { label: "Redesign", icon: "Paintbrush", tone: "info" },
  success: { label: "Success", icon: "TrendingUp", tone: "positive" },
  failure: { label: "Failure", icon: "TrendingDown", tone: "negative" },
  retrospective: { label: "Retrospective", icon: "BookOpen", tone: "neutral" },
  deprecation: { label: "Deprecation", icon: "Archive", tone: "warn" },
  kill: { label: "Kill", icon: "Skull", tone: "negative" },
};

export const TONE_COLOR: Record<EventMeta["tone"], string> = {
  neutral: "#9b9ba8",
  positive: "#3fb950",
  negative: "#f85149",
  info: "#58a6ff",
  warn: "#d29922",
};

export const STATUS_META: Record<
  FeatureStatus,
  { label: string; color: string }
> = {
  active: { label: "Active", color: "#7c5cff" },
  shipped: { label: "Shipped", color: "#3fb950" },
  killed: { label: "Killed", color: "#f85149" },
  experimental: { label: "Experimental", color: "#d29922" },
};
