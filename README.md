# Sompl — The Story Of My Product's Life

> Software has Git. Products don't. **Sompl** (the **S**tory **O**f **M**y **P**roduct's **L**ife) is the living evolutionary record of products and features — capturing the _why_ behind every feature: the hypotheses, evidence, trade-offs, metrics, and lessons that are normally lost in Slack, Notion, Jira, and people's heads.

Built for the **Mind the Product — World Product Day 2026** hackathon.

**Final demo line:** _"Git tracks code evolution. Sompl tracks **product** evolution."_

---

## ✨ What it does

| Feature | Description |
| --- | --- |
| 🏛 **Product Museum** | 6 pre-seeded famous products (Spotify, Netflix, Airbnb, Notion, Figma, Linear) with real, rich evolutionary stories — including the features they _killed_. |
| 🕒 **Evolution Timeline** | Premium chronological timeline with 14 event types (Idea → Launch → Kill), metrics, lessons, owners, and drag-to-reorder. |
| 🧬 **Evolution Graph** | Interactive React Flow lineage tree. Features branch and mutate; green/red status; click a node to open its history. |
| ✨ **Smart Commit** | Type plain English — _"We killed the social tab, only 3% of DAU used it"_ — and AI structures it into an event with metrics, alternatives, and the lesson. Paste from Slack / Jira / Notion too. |
| 📖 **AI Historian** | One click streams a rich narrative: the arc, repeating patterns, the branches that died, and what to do next. |
| ⏳ **Time Machine** | Scrub a slider to see the product's state at any point — or press play to _replay_ its entire evolution. |
| 🌍 **Public Story Pages** | Toggle a product public → a beautiful, shareable documentary page at `/story/[slug]`. |
| 📊 **Novus.ai analytics** | Every meaningful interaction is tracked (mandatory for the hackathon) — and visualized live in the in-app Activity panel. |

## 🧱 Tech stack

- **Next.js 15** (App Router) · **TypeScript** · **Tailwind** · **Framer Motion**
- **React Flow** (`@xyflow/react`) for the lineage graph
- **Groq** (free tier, Llama 3.3 70B) for structured commit parsing + streaming Historian
- **Supabase** (optional) for Auth + Postgres persistence
- **Novus.ai** for analytics (mandatory)

## 🚀 Run it (zero config)

```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

That's it — the app runs fully with **no environment variables**. Seed data, AI (graceful mock fallback), and analytics (local mirror) all work out of the box, so the demo never breaks.

### Light up the real integrations

Copy `.env.example` → `.env.local` and add keys:

- `GROQ_API_KEY` — free at [console.groq.com](https://console.groq.com/keys). Enables real AI parsing + streaming narratives.
- `NEXT_PUBLIC_NOVUS_KEY` — your Novus project key (mandatory for prize eligibility).
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — optional persistence. Run `supabase/schema.sql`.

> **Design choice:** AI and analytics are wired with graceful fallbacks. If a key is missing or rate-limited mid-demo, the product still behaves perfectly — the AI returns a high-quality structured/streamed response and Novus events are mirrored locally. Reliability first.

## 🎬 Demo script

1. Land on the homepage → browse the **Product Museum**.
2. Open **Spotify** → explore the **Timeline** and the **Evolution Graph**.
3. In **Smart Commit**, type _"Killed AI DJ voice — only 2% kept it on"_ → watch AI structure it → add to timeline.
4. Click **Tell the Story** → the **AI Historian** streams the narrative.
5. Drag the **Time Machine** slider / press play to replay the evolution.
6. Toggle **Public** → open the stunning **public story page** and **Share**.
7. Open the **Activity** panel → show live **Novus** events proving measurable interaction.

## 📦 Deploy (Vercel)

```bash
vercel
```

Set the same env vars in the Vercel dashboard. The repo includes `vercel.json`.

## 🗂 Structure

```
src/
  app/                    # routes: /, /products, /products/[slug], /story/[slug], /api/*
  components/             # Timeline, EvolutionGraph, Historian, TimeMachine, CommitBox, …
  lib/
    seed.ts               # the 6 famous-product stories
    store.tsx             # demo-safe persistent store
    novus.ts              # mandatory analytics layer
    ai/                   # Groq client + prompts + mock fallbacks
    types.ts              # domain model (events, features, products)
supabase/schema.sql       # optional Postgres schema + RLS
```

---

Built with care for product people who deserve their own version control.
