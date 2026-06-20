import { NextRequest } from "next/server";
import { groq, GROQ_MODEL } from "@/lib/ai/groq";
import { mockHistorian } from "@/lib/ai/mock";

export const runtime = "nodejs";

const SYSTEM = `You are the Sompl Historian — an insightful product storyteller.
Given a product's evolutionary timeline (features and events with metrics and lessons),
write a rich, narrative "story of how we got here."

Voice: confident, calm, a little literary — like a great product essay (think Stripe Press
meets Spotify Wrapped). Use markdown. Include:
- A short evocative intro
- '### The arc' — the through-line of the product's evolution
- '### Patterns that repeat' — 2-4 bullet insights with bolded leads
- '### The branches that died' — what was killed and the lesson
- '### What the history suggests next' — a forward-looking recommendation
End with a single memorable one-line takeaway as a blockquote.
Be specific to the actual events. Never invent metrics not implied by the data.
Keep it under ~450 words.`;

function buildContext(payload: any): string {
  const { productName, events } = payload;
  const lines = (events || []).map(
    (e: any) =>
      `- [${e.type}] ${e.date} — ${e.title}: ${e.description}` +
      (e.metrics?.length
        ? ` (metrics: ${e.metrics
            .map((m: any) => `${m.label} ${m.before ?? m.expected ?? ""}→${m.after ?? m.actual ?? ""}`)
            .join("; ")})`
        : "") +
      (e.lesson ? ` [lesson: ${e.lesson}]` : "")
  );
  return `Product: ${productName}\n\nTimeline:\n${lines.join("\n")}`;
}

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const client = groq();

  const encoder = new TextEncoder();

  if (!client) {
    const text = mockHistorian(payload.productName || "this product", payload.events || []);
    const stream = new ReadableStream({
      async start(controller) {
        // simulate streaming the mock for a live feel
        const words = text.split(" ");
        for (let i = 0; i < words.length; i++) {
          controller.enqueue(encoder.encode(words[i] + " "));
          if (i % 4 === 0) await new Promise((r) => setTimeout(r, 18));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Mocked": "1" },
    });
  }

  try {
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.7,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildContext(payload) },
      ],
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content || "";
            if (delta) controller.enqueue(encoder.encode(delta));
          }
        } catch {
          /* end */
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    const text = mockHistorian(payload.productName || "this product", payload.events || []);
    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Mocked": "1" },
    });
  }
}
