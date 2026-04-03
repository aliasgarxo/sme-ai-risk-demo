/**
 * SME AI Risk — Multi-Agent System
 *
 * Agent pipeline:
 *  1. Orchestrator  — coordinates the workflow, validates inputs
 *  2. Risk Assessor — scores each criterion 1–10 against the rubric
 *  3. Controls Advisor — recommends controls for the identified risks
 *  4. Guidance Writer — rewrites controls into plain-language recommendations
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  SCORING_CRITERIA,
  AssessmentResult,
  CriterionResult,
  calculateOverallScore,
  scoreToRiskLevel,
  CriterionDefinition,
} from "./scoring";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Input shape from wizard ──────────────────────────────────────────────────

export interface WizardInput {
  useCase: string;
  toolName: string;
  department: string;
  purpose: string;
  dataSensitivity: string;
  decisionImpact: string;
  humanOversight: string;
  transparency: string;
  errorConsequence: string;
  thirdPartySharing: string;
  geographicScope: string;
}

// ─── Agent 1: Orchestrator ────────────────────────────────────────────────────

async function orchestratorAgent(input: WizardInput): Promise<string> {
  const systemPrompt = `You are the Orchestrator Agent for an SME AI Risk Assessment system.
Your role is to validate and summarise the user's AI system information before it is analysed.
Output a concise structured summary (max 200 words) covering: purpose, data handling, decision-making scope,
human oversight level, and any notable risk signals you observe. Flag any missing or ambiguous information.`;

  const userPrompt = `AI System Details:
- Use Case Category: ${input.useCase}
- Tool Name: ${input.toolName}
- Department: ${input.department}
- Purpose: ${input.purpose}
- Data Sensitivity: ${input.dataSensitivity}
- Decision Impact: ${input.decisionImpact}
- Human Oversight: ${input.humanOversight}
- Transparency: ${input.transparency}
- Error Consequences: ${input.errorConsequence}
- Third-party Sharing: ${input.thirdPartySharing}
- Geographic Scope: ${input.geographicScope}

Summarise this system and flag any immediate concerns.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  return (response.content[0] as { text: string }).text;
}

// ─── Agent 2: Risk Assessor ───────────────────────────────────────────────────

interface CriterionScore {
  id: string;
  score: number;
  rationale: string;
}

async function riskAssessorAgent(
  input: WizardInput,
  orchestratorSummary: string
): Promise<CriterionScore[]> {
  const rubricText = SCORING_CRITERIA.map((c) => {
    const bands = c.scoringRubric
      .map((b) => `  • Score ${b.min}–${b.max} (${b.label}): ${b.description}`)
      .join("\n");
    return `\n=== ${c.name} (weight: ${c.weight}%) ===\n${bands}`;
  }).join("\n");

  const systemPrompt = `You are the Risk Assessor Agent for an SME AI Risk Assessment system.
Your task is to assign a numerical risk score from 1 to 10 (in 0.5 increments) for each of the 6 criteria below.
Score 1 = lowest risk, Score 10 = highest risk.

Use ONLY the evidence from the system description. Be precise and evidence-based.
Apply the scoring rubric exactly. Do not round to whole numbers when a half-step is more accurate.

Output ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "scores": [
    {"id": "human_oversight", "score": 4.5, "rationale": "...one sentence..."},
    {"id": "data_privacy", "score": 7.0, "rationale": "..."},
    {"id": "transparency", "score": 5.5, "rationale": "..."},
    {"id": "robustness", "score": 3.0, "rationale": "..."},
    {"id": "non_discrimination", "score": 6.0, "rationale": "..."},
    {"id": "accountability", "score": 4.0, "rationale": "..."}
  ]
}`;

  const userPrompt = `Orchestrator Summary:
${orchestratorSummary}

Full System Details:
- Purpose: ${input.purpose}
- Data Sensitivity: ${input.dataSensitivity}
- Decision Impact: ${input.decisionImpact}
- Human Oversight: ${input.humanOversight}
- Transparency: ${input.transparency}
- Error Consequences: ${input.errorConsequence}
- Third-party Sharing: ${input.thirdPartySharing}
- Geographic Scope: ${input.geographicScope}

Scoring Rubric:
${rubricText}

Score each criterion now.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const text = (response.content[0] as { text: string }).text.trim();
  // Strip any markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);
  return parsed.scores as CriterionScore[];
}

// ─── Agent 3: Controls Advisor ────────────────────────────────────────────────

interface ControlsOutput {
  redFlags: string[];
  immediateActions: string[];
  longerTermActions: string[];
  confidenceScore: number;
}

async function controlsAdvisorAgent(
  input: WizardInput,
  criterionScores: CriterionScore[]
): Promise<ControlsOutput> {
  const scoresText = criterionScores
    .map((s) => {
      const def = SCORING_CRITERIA.find((c) => c.id === s.id);
      const level = s.score <= 3.5 ? "Low" : s.score <= 6.5 ? "Medium" : "High";
      return `- ${def?.name ?? s.id}: ${s.score}/10 (${level}) — ${s.rationale}`;
    })
    .join("\n");

  const systemPrompt = `You are the Controls Advisor Agent for an SME AI Risk Assessment system.
Based on the risk scores provided, identify:
1. Red Flags (critical issues requiring immediate attention — score 7+)
2. Immediate Actions (things the SME should do NOW — within 30 days)
3. Longer-Term Actions (things to plan for — within 6 months)
4. A confidence score (0–100) reflecting how complete and reliable the assessment is based on the evidence quality.

Output ONLY valid JSON:
{
  "redFlags": ["...", "..."],
  "immediateActions": ["...", "..."],
  "longerTermActions": ["...", "..."],
  "confidenceScore": 75
}

Reference Canadian privacy law (PIPEDA), NIST AI RMF, and ISO 42001 where relevant.
Keep each item concise (max 15 words). Max 4 red flags, 5 immediate actions, 5 longer-term actions.`;

  const userPrompt = `AI Tool: ${input.toolName} — ${input.useCase}
Department: ${input.department}

Risk Scores:
${scoresText}

Error Consequences: ${input.errorConsequence}
Third-party Sharing: ${input.thirdPartySharing}

Generate controls and recommendations.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const text = (response.content[0] as { text: string }).text.trim();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as ControlsOutput;
}

// ─── Agent 4: Guidance Writer ─────────────────────────────────────────────────

async function guidanceWriterAgent(
  input: WizardInput,
  controls: ControlsOutput,
  overallScore: number
): Promise<string> {
  const riskLevel =
    overallScore <= 3.5 ? "LOW" : overallScore <= 6.5 ? "MEDIUM" : "HIGH";

  const systemPrompt = `You are the Guidance Writer Agent for an SME AI Risk Assessment system.
Your role is to produce a clear, jargon-free executive summary for a non-technical SME owner.
Write in plain English. Be direct and encouraging. Max 180 words.
Structure: 1 sentence on overall risk level → 2-3 sentences on what that means → 1-2 sentences on the most important next step.`;

  const userPrompt = `AI Tool: "${input.toolName}" used for ${input.purpose} in the ${input.department} department.
Overall Risk Score: ${overallScore}/10 — ${riskLevel} RISK

Red Flags: ${controls.redFlags.join("; ") || "None identified"}
Top Immediate Action: ${controls.immediateActions[0] ?? "Continue monitoring"}

Write the executive summary now.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  return (response.content[0] as { text: string }).text.trim();
}

// ─── Main Orchestration Function ──────────────────────────────────────────────

export async function runAssessmentPipeline(
  input: WizardInput
): Promise<AssessmentResult> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  // Agent 1: Orchestrate and summarise
  const orchestratorSummary = await orchestratorAgent(input);

  // Agent 2: Score each criterion
  const criterionScores = await riskAssessorAgent(input, orchestratorSummary);

  // Build criterion results
  const criteriaResults: CriterionResult[] = criterionScores.map((cs) => {
    const def = SCORING_CRITERIA.find(
      (c) => c.id === cs.id
    ) as CriterionDefinition;
    const riskLevel = scoreToRiskLevel(cs.score);
    return {
      id: cs.id,
      name: def.name,
      weight: def.weight,
      score: cs.score,
      weightedScore: cs.score * (def.weight / 100),
      riskLevel,
      rationale: cs.rationale,
      recommendations: [],
    };
  });

  const overallScore = calculateOverallScore(criteriaResults);
  const overallRiskLevel = scoreToRiskLevel(overallScore);

  // Agent 3: Controls and recommendations
  const controls = await controlsAdvisorAgent(input, criterionScores);

  // Agent 4: Plain-language summary
  const summary = await guidanceWriterAgent(input, controls, overallScore);

  return {
    id,
    toolName: input.toolName,
    department: input.department,
    useCase: input.useCase,
    overallScore,
    overallRiskLevel,
    confidenceScore: controls.confidenceScore,
    criteria: criteriaResults,
    redFlags: controls.redFlags,
    immediateActions: controls.immediateActions,
    longerTermActions: controls.longerTermActions,
    summary,
    createdAt,
  };
}
