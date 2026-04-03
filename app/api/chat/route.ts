import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are the AI Risk Sentinel, an expert AI governance assistant for Canadian small and medium enterprises (SMEs).

Your expertise covers:
- NIST AI Risk Management Framework (AI RMF 1.0) — Govern, Map, Measure, Manage functions
- ISO/IEC 42001:2023 — AI Management System standard
- Canadian privacy law: PIPEDA and Quebec Law 25
- EU AI Act (relevant for Canadian companies exporting to EU)
- ESG and supply chain risk for SMEs
- Practical AI governance for non-technical business owners

Your role:
- Help users understand AI risks in plain, accessible language
- Guide them through risk assessment concepts
- Explain compliance requirements relevant to their situation
- Suggest practical, affordable controls for SMEs
- Flag high-risk scenarios clearly

Tone: Professional but approachable. Concise. Avoid jargon — explain terms when you use them.
Format: Use markdown for structure (bullets, bold headings) when helpful. Keep responses focused and actionable.
Never give legal advice — recommend consulting a lawyer for specific legal questions.`;

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured." },
        { status: 503 }
      );
    }

    const { message, history } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Build message history if provided (for multi-turn chat)
    const messages: Anthropic.MessageParam[] = [];
    if (Array.isArray(history)) {
      for (const h of history) {
        if (h.role === "user" || h.role === "assistant") {
          messages.push({ role: h.role, content: h.content });
        }
      }
    }
    messages.push({ role: "user", content: message });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001", // Fast, cost-effective for chat
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = (response.content[0] as { text: string }).text;
    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("[/api/chat] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to connect to AI." },
      { status: 500 }
    );
  }
}
