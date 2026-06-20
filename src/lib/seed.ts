import { Product, Feature, EvolutionEvent, ProductBundle } from "./types";

// Rich, realistic evolutionary stories for famous products.
// These power the "Product Museum" and make the demo land instantly.

const P = (
  id: string,
  slug: string,
  name: string,
  description: string,
  category: string,
  cover: string,
  accent: string
): Product => ({
  id,
  slug,
  name,
  description,
  category,
  cover,
  accent,
  isPublic: true,
  owner: "museum",
  seeded: true,
});

// ── SPOTIFY ──────────────────────────────────────────────────────────────
const spotify: ProductBundle = {
  product: P(
    "spotify",
    "spotify",
    "Spotify",
    "How a music streaming app became a personalized audio platform — through bold bets, killed features, and one cultural phenomenon.",
    "Consumer / Audio",
    "aurora",
    "#1DB954"
  ),
  features: [
    { id: "sp-discovery", productId: "spotify", parentId: null, name: "Discovery Engine", summary: "The recommendation backbone everything branched from.", status: "shipped" },
    { id: "sp-dw", productId: "spotify", parentId: "sp-discovery", name: "Discover Weekly", summary: "Personalized 30-track playlist, refreshed every Monday.", status: "shipped" },
    { id: "sp-wrapped", productId: "spotify", parentId: "sp-discovery", name: "Wrapped", summary: "Annual personalized year-in-review. A viral growth engine.", status: "shipped" },
    { id: "sp-aisearch", productId: "spotify", parentId: "sp-discovery", name: "AI Search", summary: "Natural-language search for moods, vibes and forgotten songs.", status: "active" },
    { id: "sp-social", productId: "spotify", parentId: null, name: "Social Listening", summary: "Friend activity & shared sessions. A graveyard of bets.", status: "killed" },
    { id: "sp-djx", productId: "spotify", parentId: "sp-aisearch", name: "AI DJ", summary: "Generative AI DJ with a synthetic voice between tracks.", status: "experimental" },
  ],
  events: [
    e("sp-1", "sp-discovery", "research", "2013-02-10", "Users can't find anything past their library", "Research showed 60% of sessions were the same ~40 songs. The catalog of 20M+ tracks was effectively invisible.", { metrics: [{ label: "Catalog used per user", before: "0.0004%", after: "—" }], owner: "Discovery Team", lesson: "A huge catalog is worthless without discovery. Abundance is a UX problem, not an asset." }),
    e("sp-2", "sp-dw", "launch", "2015-07-20", "Discover Weekly ships to all users", "A weekly auto-generated playlist using collaborative filtering + NLP on playlists. Internal skeptics called it 'a robot DJ nobody asked for.'", { metrics: [{ label: "Streams in 10 weeks", expected: "200M", actual: "1.7B" }], owner: "Matt Ogle", source: "ai" }),
    e("sp-3", "sp-dw", "success", "2015-12-01", "Discover Weekly becomes Spotify's identity", "The feature reframed Spotify from 'the app with all the music' to 'the app that knows me.' Retention for active DW listeners jumped sharply.", { metrics: [{ label: "Weekly retention lift", before: "—", after: "+30%" }], lesson: "Personalization, not catalog size, was the real moat. Lean into what the data uniquely enables." }),
    e("sp-4", "sp-wrapped", "idea", "2016-09-01", "What if we gave listening data back as a story?", "A growth experiment: turn each user's listening into a shareable, personal narrative at year end.", { owner: "Growth" }),
    e("sp-5", "sp-wrapped", "launch", "2016-12-06", "Wrapped launches", "Shareable cards with top artists, songs and minutes. Designed mobile-first for Instagram Stories.", { metrics: [{ label: "Shares week 1", expected: "1M", actual: "tens of millions" }], source: "ai" }),
    e("sp-6", "sp-wrapped", "success", "2021-12-01", "Wrapped becomes a global cultural event", "Wrapped now drives the single biggest acquisition spike of the year and trends worldwide every December.", { metrics: [{ label: "App downloads in Dec", before: "baseline", after: "+21%" }], lesson: "Give users their own data back as identity, and they'll market the product for you." }),
    e("sp-7", "sp-social", "experiment", "2018-04-01", "Bet on social listening", "Friend feeds, collaborative real-time sessions, and a social tab. The thesis: music is social.", { owner: "Social Team", metrics: [{ label: "DAU using social tab", expected: "25%", actual: "4%" }] }),
    e("sp-8", "sp-social", "failure", "2019-11-01", "Engagement never materializes", "People listen to music alone far more than expected. The social tab cannibalized prime navigation real estate.", { metrics: [{ label: "Social tab DAU", before: "4%", after: "3%" }] }),
    e("sp-9", "sp-social", "kill", "2020-03-01", "Social tab killed", "Removed from the main nav. Learnings folded into lightweight sharing (Blends, Jam) years later.", { lesson: "'X is social' is a seductive but often wrong thesis. Validate the behavior, not the platitude.", source: "ai" }),
    e("sp-10", "sp-aisearch", "idea", "2022-08-15", "Users describe what they want — not what it's called", "Support reports flooded with 'that song from the ad' and 'something to study to.' Keyword search failed all of it.", {}),
    e("sp-11", "sp-aisearch", "mvp", "2023-05-01", "Natural-language search MVP", "Embeddings + LLM intent parsing over moods, activities, lyrics and eras. Shipped to 5% of users.", { metrics: [{ label: "Search-to-play rate", before: "31%", after: "44%" }], owner: "Search Team" }),
    e("sp-12", "sp-djx", "experiment", "2023-02-22", "AI DJ goes live in beta", "A generative DJ with a synthetic voice that introduces tracks and reads your taste in real time.", { metrics: [{ label: "Avg session w/ DJ", expected: "+10%", actual: "+18%" }], owner: "Personalization", source: "ai" }),
  ],
};

// ── NETFLIX ──────────────────────────────────────────────────────────────
const netflix: ProductBundle = {
  product: P(
    "netflix",
    "netflix",
    "Netflix",
    "From DVD-by-mail to streaming giant — including the password-sharing gamble that everyone said would fail.",
    "Consumer / Streaming",
    "crimson",
    "#E50914"
  ),
  features: [
    { id: "nf-stream", productId: "netflix", parentId: null, name: "Streaming Platform", summary: "The pivot that defined the company.", status: "shipped" },
    { id: "nf-recs", productId: "netflix", parentId: "nf-stream", name: "Recommendations", summary: "The engine behind 80% of what's watched.", status: "shipped" },
    { id: "nf-interactive", productId: "netflix", parentId: "nf-stream", name: "Interactive Shows", summary: "Choose-your-own-adventure storytelling. A bold, then abandoned, bet.", status: "killed" },
    { id: "nf-password", productId: "netflix", parentId: "nf-stream", name: "Paid Sharing", summary: "The password-sharing crackdown everyone predicted would backfire.", status: "shipped" },
    { id: "nf-games", productId: "netflix", parentId: "nf-stream", name: "Netflix Games", summary: "Mobile games bundled into the subscription.", status: "experimental" },
  ],
  events: [
    e("nf-1", "nf-stream", "idea", "2007-01-15", "Bet the company on streaming", "While DVD-by-mail was still profitable, leadership chose to cannibalize it before someone else did.", { lesson: "Disrupt your own cash cow before a competitor does it for you." }),
    e("nf-2", "nf-recs", "launch", "2009-09-21", "$1M Netflix Prize awarded", "An open competition to improve recommendation accuracy by 10%. The winning algorithm was never fully deployed, but the muscle it built reshaped the product.", { metrics: [{ label: "Accuracy improvement", expected: "10%", actual: "10.06%" }], source: "ai" }),
    e("nf-3", "nf-interactive", "experiment", "2018-12-28", "Bandersnatch launches", "An interactive film where viewers choose the story. A technical and narrative moonshot.", { metrics: [{ label: "Avg completion paths", before: "—", after: "5+" }], owner: "Interactive Team" }),
    e("nf-4", "nf-interactive", "failure", "2023-03-01", "Interactive content quietly wound down", "Production complexity was enormous, the tech stack was bespoke, and most viewers wanted to lean back, not lean in.", { metrics: [{ label: "Interactive titles produced", before: "~20", after: "frozen" }] }),
    e("nf-5", "nf-interactive", "kill", "2024-12-01", "Most interactive titles removed", "Netflix retired the majority of interactive specials, keeping only a handful for kids.", { lesson: "Novel format ≠ desired behavior. Audiences mostly want to relax, not to work.", source: "ai" }),
    e("nf-6", "nf-password", "research", "2022-04-19", "100M+ households share passwords", "Subscriber growth stalled and the stock cratered 35% in a day. Password sharing was no longer free marketing — it was lost revenue.", { metrics: [{ label: "Sharing households", before: "—", after: "100M+" }] }),
    e("nf-7", "nf-password", "experiment", "2023-02-01", "Paid sharing tested in Latin America", "Charging for extra members outside the household. Press declared it a catastrophe in waiting.", { metrics: [{ label: "Predicted churn (analysts)", expected: "severe", actual: "tbd" }], owner: "Monetization" }),
    e("nf-8", "nf-password", "success", "2023-11-01", "Paid sharing rolls out globally — and works", "Short-term cancellations were dwarfed by new sign-ups and added-member revenue. Netflix added millions of subscribers.", { metrics: [{ label: "Net subscriber adds Q3", expected: "negative", actual: "+8.8M" }], lesson: "Bold monetization moves are survivable when the core product is genuinely loved. Loud predictions of doom are not data." }),
    e("nf-9", "nf-games", "mvp", "2021-11-02", "Netflix Games launches on mobile", "Games bundled free with the subscription, ad-free and no in-app purchases.", { metrics: [{ label: "Adoption of subscribers", expected: "10%", actual: "<1%" }], owner: "Games", source: "ai" }),
    e("nf-10", "nf-games", "iteration", "2024-06-01", "Pivot to bigger licensed IP", "After weak adoption, strategy shifted from many small games to fewer marquee titles like GTA.", { lesson: "When adoption is tiny, don't iterate the volume — change the bet." }),
  ],
};

// ── AIRBNB ───────────────────────────────────────────────────────────────
const airbnb: ProductBundle = {
  product: P(
    "airbnb",
    "airbnb",
    "Airbnb",
    "Air mattresses to a global marketplace — and the pandemic pivot that nearly broke, then refocused, the company.",
    "Marketplace / Travel",
    "sunset",
    "#FF5A5F"
  ),
  features: [
    { id: "ab-stays", productId: "airbnb", parentId: null, name: "Home Stays", summary: "The core marketplace.", status: "shipped" },
    { id: "ab-exp", productId: "airbnb", parentId: "ab-stays", name: "Experiences", summary: "Host-led activities. Expanded the mission beyond a place to sleep.", status: "shipped" },
    { id: "ab-online", productId: "airbnb", parentId: "ab-exp", name: "Online Experiences", summary: "Virtual experiences born from the 2020 travel collapse.", status: "killed" },
    { id: "ab-categories", productId: "airbnb", parentId: "ab-stays", name: "Categories Redesign", summary: "Browse by vibe, not destination. The biggest UX change in a decade.", status: "shipped" },
  ],
  events: [
    e("ab-1", "ab-stays", "idea", "2008-08-01", "Rent air mattresses during a sold-out conference", "Three founders rented out their apartment floor. The idea sounded absurd to nearly every investor.", { lesson: "The best ideas often look like toys or jokes at the start." }),
    e("ab-2", "ab-exp", "launch", "2016-11-17", "Experiences launches", "Host-led tours, classes and adventures — Airbnb's bet that it could own the whole trip, not just the bed.", { metrics: [{ label: "Cities at launch", before: "0", after: "12" }], owner: "Trips Team", source: "ai" }),
    e("ab-3", "ab-online", "experiment", "2020-04-09", "Online Experiences born from crisis", "Travel collapsed overnight in the pandemic. The team shipped virtual experiences in weeks to keep hosts earning.", { metrics: [{ label: "Time to ship", expected: "quarters", actual: "3 weeks" }], owner: "Crisis Team" }),
    e("ab-4", "ab-online", "success", "2020-09-01", "A lifeline during lockdown", "Online Experiences gave displaced hosts income and kept the brand alive when stays were near zero.", { metrics: [{ label: "Bookings during lockdown", before: "0", after: "hundreds of thousands" }] }),
    e("ab-5", "ab-online", "kill", "2022-09-01", "Online Experiences sunset", "As travel roared back, virtual experiences no longer fit the mission. The team killed it to refocus.", { lesson: "A great crisis product can still be the wrong long-term product. Kill it cleanly when the context changes.", source: "ai" }),
    e("ab-6", "ab-categories", "research", "2021-06-01", "People search by city — but dream by vibe", "Search data showed users typing destinations, but interviews revealed they fantasized about types of places: treehouses, beachfront, design.", {}),
    e("ab-7", "ab-categories", "redesign", "2022-05-11", "Categories: browse by vibe, not place", "The homepage reoriented around 56 categories. The single biggest change to the product in a decade.", { metrics: [{ label: "Listings surfaced outside top cities", before: "low", after: "+significant" }], owner: "Brian Chesky" }),
    e("ab-8", "ab-categories", "success", "2022-12-01", "Discovery spreads demand", "Categories spread bookings into places people never searched for, easing over-tourism in hot spots.", { metrics: [{ label: "Views of non-top listings", before: "baseline", after: "+17%" }], lesson: "Match the UI to how people dream, not just how they type." }),
  ],
};

// ── NOTION ───────────────────────────────────────────────────────────────
const notion: ProductBundle = {
  product: P(
    "notion",
    "notion",
    "Notion",
    "A near-death rewrite, a beloved blocks model, and a careful, late-but-right entry into AI.",
    "Productivity / SaaS",
    "graphite",
    "#FFFFFF"
  ),
  features: [
    { id: "no-blocks", productId: "notion", parentId: null, name: "Blocks Engine", summary: "Everything-is-a-block model. The foundation.", status: "shipped" },
    { id: "no-db", productId: "notion", parentId: "no-blocks", name: "Databases", summary: "Turned docs into a flexible app builder.", status: "shipped" },
    { id: "no-ai", productId: "notion", parentId: "no-blocks", name: "Notion AI", summary: "Writing & Q&A assistant inside the workspace.", status: "shipped" },
    { id: "no-qa", productId: "notion", parentId: "no-ai", name: "AI Q&A / Notion Q&A", summary: "Ask your entire workspace a question.", status: "active" },
  ],
  events: [
    e("no-1", "no-blocks", "failure", "2015-09-01", "Notion 1.0 nearly kills the company", "The first version was too ambitious and buggy. The team ran out of money and laid almost everyone off.", { lesson: "Ambition without focus burns runway. Sometimes the right move is a brutal rewrite." }),
    e("no-2", "no-blocks", "redesign", "2016-03-01", "The blocks rewrite", "A small team rebuilt around a single elegant idea: every piece of content is a draggable, transformable block.", { metrics: [{ label: "Team size", before: "~10", after: "4" }], owner: "Ivan Zhao", source: "ai" }),
    e("no-3", "no-db", "launch", "2018-03-01", "Databases ship", "Tables, boards and calendars on top of blocks turned Notion from a doc tool into a build-your-own-tool platform.", { metrics: [{ label: "Power-user retention", before: "baseline", after: "+strong" }] }),
    e("no-4", "no-ai", "research", "2022-10-01", "Should we even do AI?", "Internal debate: bolt on a chatbot, or weave AI natively into blocks? The team waited until it could do the latter well.", {}),
    e("no-5", "no-ai", "launch", "2023-02-22", "Notion AI launches", "Generate, summarize and edit inside any block. Priced as an add-on rather than bundled.", { metrics: [{ label: "Waitlist signups", expected: "tens of thousands", actual: "millions" }], owner: "AI Team", source: "ai" }),
    e("no-6", "no-qa", "mvp", "2023-11-01", "Q&A: ask your whole workspace", "RAG over the user's pages so they can ask 'what did we decide about pricing?' and get a cited answer.", { metrics: [{ label: "Queries per active user/wk", expected: "2", actual: "6" }], owner: "AI Team" }),
    e("no-7", "no-qa", "iteration", "2024-05-01", "Connectors expand the corpus", "Q&A extended to Slack and Google Drive so answers draw on context beyond Notion itself.", { lesson: "The value of an AI assistant scales with how much of the user's real context it can see." }),
  ],
};

// ── FIGMA ────────────────────────────────────────────────────────────────
const figma: ProductBundle = {
  product: P(
    "figma",
    "figma",
    "Figma",
    "A browser-based design tool that bet on multiplayer years too early — and the handoff feature it took a decade to get right.",
    "Design / SaaS",
    "violet",
    "#A259FF"
  ),
  features: [
    { id: "fg-canvas", productId: "figma", parentId: null, name: "Browser Canvas", summary: "Design in the browser. The contrarian core bet.", status: "shipped" },
    { id: "fg-multiplayer", productId: "figma", parentId: "fg-canvas", name: "Multiplayer", summary: "Real-time collaborative editing. The Google-Docs-for-design moment.", status: "shipped" },
    { id: "fg-devmode", productId: "figma", parentId: "fg-canvas", name: "Dev Mode", summary: "A dedicated space for engineers to inspect and ship designs.", status: "shipped" },
    { id: "fg-ai", productId: "figma", parentId: "fg-canvas", name: "Figma AI", summary: "Generative design, search and rename tools.", status: "experimental" },
  ],
  events: [
    e("fg-1", "fg-canvas", "idea", "2012-09-01", "Design belongs in the browser", "WebGL was immature and skeptics said serious design could never run in a browser. Figma spent years on the rendering engine before shipping anything.", { lesson: "A contrarian bet needs patience. Figma stayed in stealth ~3 years to make the core actually work." }),
    e("fg-2", "fg-multiplayer", "launch", "2016-09-27", "Figma launches with multiplayer", "Real-time collaborative editing on the canvas — 'Google Docs for design' — at public launch.", { metrics: [{ label: "Collaboration as wedge", before: "—", after: "primary growth loop" }], owner: "Founding Team", source: "ai" }),
    e("fg-3", "fg-multiplayer", "success", "2019-06-01", "Multiplayer becomes the moat", "Teams adopted Figma because the whole team could be in one file. The collaboration loop drove viral org-wide spread.", { metrics: [{ label: "Seats per account", before: "few", after: "whole teams" }] }),
    e("fg-4", "fg-devmode", "feedback", "2020-01-01", "Engineers feel like second-class citizens", "Devs only needed to inspect and export, but the tool was built for designers. Handoff was a constant friction point.", {}),
    e("fg-5", "fg-devmode", "launch", "2023-06-21", "Dev Mode ships", "A dedicated mode with inspect, code snippets, status tracking and IDE integration — designed for engineers, not designers.", { metrics: [{ label: "Eng seats activated", expected: "moderate", actual: "high" }], owner: "Dev Mode Team", source: "ai" }),
    e("fg-6", "fg-ai", "experiment", "2024-06-26", "Figma AI announced at Config", "Generative first drafts, visual search and auto-rename. Ambitious — and quickly controversial.", { owner: "AI Team" }),
    e("fg-7", "fg-ai", "failure", "2024-07-02", "'Make Design' pulled after similarity backlash", "An AI feature produced outputs resembling existing apps. Figma paused it within days to rebuild trust.", { lesson: "Ship AI features with provenance and guardrails first. Trust is far harder to rebuild than to protect.", source: "ai" }),
  ],
};

// ── LINEAR (the indie/craft example) ─────────────────────────────────────
const linear: ProductBundle = {
  product: P(
    "linear",
    "linear",
    "Linear",
    "The issue tracker that won on craft — by saying no to almost everything and obsessing over speed.",
    "Developer Tools / SaaS",
    "midnight",
    "#5E6AD2"
  ),
  features: [
    { id: "li-core", productId: "linear", parentId: null, name: "Issue Tracker", summary: "Keyboard-first, blazing-fast core.", status: "shipped" },
    { id: "li-cycles", productId: "linear", parentId: "li-core", name: "Cycles", summary: "Opinionated lightweight sprints.", status: "shipped" },
    { id: "li-sync", productId: "linear", parentId: "li-core", name: "Sync Engine", summary: "Local-first realtime sync. The invisible feature behind the speed.", status: "shipped" },
    { id: "li-projects", productId: "linear", parentId: "li-cycles", name: "Projects & Initiatives", summary: "Planning layer above issues, added carefully and late.", status: "shipped" },
  ],
  events: [
    e("li-1", "li-core", "idea", "2019-05-01", "Issue tracking is slow and joyless", "The founders, ex-Uber/Coinbase, were tired of bloated, sluggish trackers. The thesis: speed and craft are features.", { lesson: "In a crowded category, craft and speed can be the entire differentiator." }),
    e("li-2", "li-sync", "research", "2019-08-01", "The speed has to be architectural", "They concluded you can't bolt 'fast' onto a slow stack. So they built a local-first sync engine before most features.", { owner: "Engineering" }),
    e("li-3", "li-core", "mvp", "2020-01-01", "Invite-only launch", "A deliberately tiny, polished MVP. Heavy gatekeeping created demand and protected the quality bar.", { metrics: [{ label: "Waitlist", before: "0", after: "long" }], source: "ai" }),
    e("li-4", "li-cycles", "launch", "2020-06-01", "Cycles ship — opinionated by design", "Instead of configurable everything, Cycles offered one well-designed way to run iterations.", { metrics: [{ label: "Setup time vs competitors", before: "hours", after: "minutes" }], lesson: "Opinionated defaults beat infinite configuration for teams who just want to ship." }),
    e("li-5", "li-projects", "feedback", "2021-09-01", "Teams need planning above issues", "Users loved the issue layer but asked for a way to plan larger bodies of work without bloating the core.", {}),
    e("li-6", "li-projects", "launch", "2022-03-01", "Projects ship — carefully scoped", "A planning layer that stayed true to the keyboard-first, fast ethos rather than copying heavyweight PM tools.", { metrics: [{ label: "Enterprise adoption", before: "low", after: "growing" }], owner: "Product", source: "ai" }),
    e("li-7", "li-core", "success", "2023-01-01", "Craft compounds into a category leader", "Linear became the default tracker for startups, winning on the very dimension incumbents ignored: feel.", { metrics: [{ label: "Brand love (NPS proxy)", before: "—", after: "very high" }], lesson: "Consistency of craft across every detail compounds into a brand moat money can't buy." }),
  ],
};

// helper to build an event tersely
function e(
  id: string,
  featureId: string,
  type: EvolutionEvent["type"],
  date: string,
  title: string,
  description: string,
  extra: Partial<EvolutionEvent> = {}
): EvolutionEvent {
  return {
    id,
    featureId,
    type,
    date,
    title,
    description,
    source: extra.source ?? "manual",
    ...extra,
  };
}

export const SEED_BUNDLES: ProductBundle[] = [
  spotify,
  netflix,
  airbnb,
  notion,
  figma,
  linear,
];

export const SEED_PRODUCTS: Product[] = SEED_BUNDLES.map((b) => b.product);

export function findSeedBundle(slugOrId: string): ProductBundle | undefined {
  return SEED_BUNDLES.find(
    (b) => b.product.slug === slugOrId || b.product.id === slugOrId
  );
}
