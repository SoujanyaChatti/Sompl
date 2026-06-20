import { NextRequest, NextResponse } from "next/server";
import { groq, GROQ_MODEL } from "@/lib/ai/groq";
import { mockParseCommit } from "@/lib/ai/mock";
import { EVENT_META } from "@/lib/types";

export const runtime = "nodejs";

const EVENT_TYPES = Object.keys(EVENT_META);

const SYSTEM = `You are Sompl's product historian. You convert a product manager's
free-text "commit" about a feature into a single structured timeline event.
Be precise, infer intelligently, and surface the kind of insight a sharp PM would.
Always pick the single best event type from the allowed list.`;

const TOOL = {
  type: "function" as const,
  function: {
    name: "create_event",
    description: "Create one structured product evolution event from the text.",
    parameters: {
      type: "object",
      properties: {
        type: { type: "string", enum: EVENT_TYPES, description: "The event type." },
        title: { type: "string", description: "A crisp 4-9 word headline." },
        description: { type: "string", description: "A clear 1-3 sentence description of what happened and why." },
        metrics: {
          type: "array",
          description: "Any metrics implied or stated, before/after or expected/actual.",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              before: { type: "string" },
              after: { type: "string" },
              expected: { type: "string" },
              actual: { type: "string" },
            },
            required: ["label"],
          },
        },
        alternatives: {
          type: "array",
          items: { type: "string" },
          description: "1-3 plausible alternative paths the team could have taken.",
        },
        lesson: { type: "string", description: "One sharp, transferable product lesson." },
      },
      required: ["type", "title", "description"],
    },
  },
};

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const client = groq();
  if (!client) {
    return NextResponse.json({ ...mockParseCommit(text), mocked: true });
  }

  try {
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Allowed types: ${EVENT_TYPES.join(", ")}.\n\nCommit:\n"""${text}"""` },
      ],
      tools: [TOOL],
      tool_choice: { type: "function", function: { name: "create_event" } },
    });

    const call = completion.choices[0]?.message?.tool_calls?.[0];
    if (!call) return NextResponse.json({ ...mockParseCommit(text), mocked: true });
    const parsed = JSON.parse(call.function.arguments);
    if (!EVENT_TYPES.includes(parsed.type)) parsed.type = mockParseCommit(text).type;
    return NextResponse.json({ ...parsed, mocked: false });
  } catch (err) {
    return NextResponse.json({ ...mockParseCommit(text), mocked: true });
  }
}
