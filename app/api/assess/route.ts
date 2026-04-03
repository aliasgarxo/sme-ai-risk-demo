import { NextResponse } from "next/server";
import { runAssessmentPipeline, WizardInput } from "@/lib/agents";

export const maxDuration = 60; // Vercel function timeout in seconds

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured. Please add it to your environment variables." },
        { status: 503 }
      );
    }

    const body = await req.json();

    // Validate required fields
    const required: (keyof WizardInput)[] = [
      "useCase",
      "toolName",
      "department",
      "purpose",
      "dataSensitivity",
      "decisionImpact",
      "humanOversight",
      "transparency",
      "errorConsequence",
      "thirdPartySharing",
      "geographicScope",
    ];

    const missing = required.filter((k) => !body[k] || String(body[k]).trim() === "");
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const input: WizardInput = {
      useCase: body.useCase,
      toolName: body.toolName,
      department: body.department,
      purpose: body.purpose,
      dataSensitivity: body.dataSensitivity,
      decisionImpact: body.decisionImpact,
      humanOversight: body.humanOversight,
      transparency: body.transparency,
      errorConsequence: body.errorConsequence,
      thirdPartySharing: body.thirdPartySharing,
      geographicScope: body.geographicScope,
    };

    const result = await runAssessmentPipeline(input);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("[/api/assess] Error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
