import { NextRequest, NextResponse } from "next/server";
import { AnthropicConfigError, callAnthropic } from "@/lib/anthropic";
import { retrieveRelevantDocuments } from "@/lib/sample-knowledge";
import {
  EMAIL_SYSTEM_PROMPT,
  KNOWLEDGE_SYSTEM_PROMPT,
  REPORT_SYSTEM_PROMPT,
  TENDER_SYSTEM_PROMPT,
} from "@/lib/prompts";

export const runtime = "nodejs";

type Mode = "knowledge" | "report" | "email" | "tender";

export async function POST(req: NextRequest) {
  let body: { mode?: Mode; input?: string; tone?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const { mode, input, tone } = body;

  if (!mode || !input || !input.trim()) {
    return NextResponse.json({ error: "Both 'mode' and 'input' are required." }, { status: 400 });
  }

  try {
    if (mode === "knowledge") {
      const { documents, source } = await retrieveRelevantDocuments(input, 3);

      if (documents.length === 0) {
        return NextResponse.json({
          answer:
            "No matching source documents were found in the knowledge base for this question, so no answer is provided. (This is intentional — babyPM does not answer from unsourced general knowledge.)",
          status: "red",
          sources: [],
          retrievalSource: source,
        });
      }

      const context = documents
        .map((d) => `Source: ${d.title}\n${d.content}`)
        .join("\n\n---\n\n");

      const answer = await callAnthropic(KNOWLEDGE_SYSTEM_PROMPT, [
        { role: "user", content: `Source excerpts:\n\n${context}\n\nQuestion: ${input}` },
      ]);

      return NextResponse.json({
        answer,
        status: "green",
        sources: documents.map((d) => d.title),
        retrievalSource: source,
      });
    }

    if (mode === "report") {
      const answer = await callAnthropic(REPORT_SYSTEM_PROMPT, [
        { role: "user", content: `Rough notes:\n\n${input}` },
      ]);
      return NextResponse.json({ answer });
    }

    if (mode === "email") {
      const selectedTone = tone || "Concise";
      const answer = await callAnthropic(EMAIL_SYSTEM_PROMPT, [
        { role: "user", content: `Tone: ${selectedTone}\n\nOriginal email:\n\n${input}` },
      ]);
      return NextResponse.json({ answer });
    }

    if (mode === "tender") {
      const { documents } = await retrieveRelevantDocuments(
        "CWW services program project advisory test management case study",
        3
      );
      const context = documents.map((d) => `${d.title}:\n${d.content}`).join("\n\n---\n\n");

      const answer = await callAnthropic(TENDER_SYSTEM_PROMPT, [
        {
          role: "user",
          content: `CWW context (service description and case studies):\n\n${context}\n\nRFP requirements:\n\n${input}`,
        },
      ]);
      return NextResponse.json({ answer });
    }

    return NextResponse.json({ error: `Unknown mode: ${mode}` }, { status: 400 });
  } catch (err) {
    if (err instanceof AnthropicConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
