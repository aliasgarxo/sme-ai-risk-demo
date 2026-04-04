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

// ─── Regulatory Reference Context ────────────────────────────────────────────
// Key excerpts from NIST AI RMF 1.0, ISO/IEC 42001:2023, and PIPEDA.
// Injected directly into agent prompts so assessments cite real framework clauses.

const REGULATORY_CONTEXT = `
=== NIST AI RISK MANAGEMENT FRAMEWORK (AI RMF 1.0) ===

GOVERN Function — Establish policies, processes, and accountability:
• GOVERN 1.1: Policies, processes, and practices exist and are followed for risk identification, classification, and management.
• GOVERN 1.2: Accountability designations for AI risk management are clear (roles such as AI owner, product manager, legal, HR).
• GOVERN 1.3: Organisational teams understand their specific roles in AI risk management.
• GOVERN 1.6: Policies and procedures exist for AI risk management throughout the AI lifecycle.
• GOVERN 2.2: The organisational risk tolerance with respect to AI is determined and communicated.
• GOVERN 4.1: Organisational teams are committed to transparent, accountable, and explainable AI practices.
• GOVERN 5.1: Organisational policies and procedures address AI vendor relationships and supply chain risk.
• GOVERN 6.1: Policies and procedures for engaging affected communities and users are established.

MAP Function — Identify and classify AI risks:
• MAP 1.1: Context is established for the AI risk assessment (intended use, purpose, stakeholders, environment).
• MAP 1.5: Organisational risk priorities, risk tolerance, and legal/regulatory requirements are identified.
• MAP 1.6: Practices for model transparency and explainability are in place.
• MAP 2.1: Scientific findings, legal requirements, and best practices are reviewed when categorising AI risks.
• MAP 2.2: Scientific findings on AI risk for the particular context are reviewed and applied.
• MAP 3.5: Risks to individuals, groups, and society from the AI system are identified and prioritised.
• MAP 5.1: Likelihood and magnitude of each identified risk are estimated, prioritised, and documented.

MEASURE Function — Analyse and assess AI risks:
• MEASURE 1.1: Approaches and metrics for AI risk assessment are established.
• MEASURE 2.1: Test sets, metrics, and details are established to evaluate AI risk.
• MEASURE 2.2: AI systems are evaluated regularly for trustworthiness and performance against benchmarks.
• MEASURE 2.5: AI system's effectiveness in minimising negative impacts is evaluated (including equity, bias, privacy).
• MEASURE 2.6: AI system's performance and risk are evaluated for known failure modes and edge cases.
• MEASURE 2.7: AI system is regularly evaluated and re-tested for performance and trustworthiness.
• MEASURE 2.10: Privacy risk of the AI system is examined and documented.
• MEASURE 4.1: Metrics for risk tolerance, residual risk, and risk response are established.

MANAGE Function — Prioritise and address AI risks:
• MANAGE 1.1: A process exists for triaging and addressing AI risks.
• MANAGE 1.3: Responses to identified risks are planned, monitored, and documented.
• MANAGE 2.2: Mechanisms are in place for affected individuals to report concerns about AI outputs.
• MANAGE 2.4: Risk treatments, including risk sharing, risk transfer, avoidance, and acceptance, are documented.
• MANAGE 3.1: AI risks and benefits are communicated to relevant stakeholders.
• MANAGE 4.1: Post-deployment AI risk management activities are monitored and documented.

=== ISO/IEC 42001:2023 — AI MANAGEMENT SYSTEM ===

Clause 4 — Context of the Organisation:
• 4.1: Understand internal/external issues relevant to AI use (purpose, stakeholders, regulatory environment).
• 4.2: Understand needs and expectations of interested parties (users, employees, regulators, public).

Clause 6 — Planning:
• 6.1.1: Identify risks and opportunities arising from AI use; plan actions to address them.
• 6.1.2: Carry out an AI risk assessment: identify, analyse, and evaluate AI-specific risks.
• 6.1.3: Establish AI risk treatment options; implement controls; maintain a risk treatment plan.
• 6.2: Establish AI objectives and plans for achieving them, aligned with policy.

Clause 8 — Operation:
• 8.2: Conduct AI risk assessments at planned intervals and when significant changes occur.
• 8.3: Implement the AI risk treatment plan; document results.
• 8.4: Perform AI impact assessments covering fundamental rights, safety, privacy, and fairness.
• 8.5: Implement data governance controls for AI (data quality, provenance, appropriateness).
• 8.6: Implement controls for AI system design (transparency, explainability, robustness).
• 8.7: Implement controls for AI system operation (monitoring, human oversight, incident response).

Clause 9 — Performance Evaluation:
• 9.1: Monitor, measure, analyse, and evaluate AI management system performance.
• 9.2: Conduct internal audits at planned intervals.
• 9.3: Review AI management system at planned intervals (management review).

Clause 10 — Improvement:
• 10.1: Continual improvement of the AI management system.
• 10.2: Address nonconformities; implement corrective actions.

Annex A Controls (selected):
• A.2.2: Policies for responsible AI development and deployment.
• A.3.3: AI awareness and training for all relevant staff.
• A.4.3: Roles and responsibilities for AI risk management.
• A.6.1: System impact assessment before deployment.
• A.6.2: Data quality and governance for AI training and operation.
• A.7.4: Transparency and explainability requirements for AI outputs.
• A.8.3: Human oversight and intervention mechanisms.
• A.8.5: Logging and monitoring of AI system behaviour.
• A.9.3: Bias and fairness evaluation for AI systems.

=== PIPEDA — PERSONAL INFORMATION PROTECTION AND ELECTRONIC DOCUMENTS ACT (CANADA) ===

10 Fair Information Principles:
• Principle 1 — Accountability: Designate a person responsible for the organisation's compliance with PIPEDA.
• Principle 2 — Identifying Purposes: Identify the purposes for which personal information is collected before or at the time of collection.
• Principle 3 — Consent: The knowledge and consent of the individual are required for collection, use, or disclosure of personal information (with exceptions).
• Principle 4 — Limiting Collection: Collect only the information necessary for the identified purposes (data minimisation).
• Principle 5 — Limiting Use, Disclosure, Retention: Use or disclose personal information only for the purpose for which it was collected; retain only as long as necessary.
• Principle 6 — Accuracy: Personal information must be as accurate, complete, and up-to-date as is necessary.
• Principle 7 — Safeguards: Protect personal information with security safeguards appropriate to the sensitivity of the information.
• Principle 8 — Openness: Make information about privacy policies and practices readily available.
• Principle 9 — Individual Access: Upon request, inform individuals of the existence, use, and disclosure of their personal information.
• Principle 10 — Challenging Compliance: Individuals can challenge an organisation's compliance with PIPEDA.

Key PIPEDA obligations for AI systems:
• Automated decision-making using personal data requires clear legal basis and disclosure.
• Consent must be meaningful — not buried in terms of service; individuals must understand what they are agreeing to.
• Sensitive data (health, financial, biometric, racial/ethnic origin) requires higher standard of protection and more explicit consent.
• Data breach notification required to OPC and affected individuals when there is real risk of significant harm.
• Privacy Impact Assessments (PIAs) recommended before deploying AI systems handling personal information.
• Cross-border transfers of personal information must ensure equivalent protection in the recipient jurisdiction.
`;

// ─── Input shape from wizard ──────────────────────────────────────────────

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

// ─── Agent 1: Orchestrator ────────────────────────────────────────────────

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

// ─── Agent 2: Risk Assessor ────────────────────────────────────────────────

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
In your rationale, cite specific NIST AI RMF sub-categories (e.g. "GOVERN 1.2", "MEASURE 2.5"),
ISO 42001 clauses (e.g. "ISO 42001 Clause 8.4", "Annex A.8.3"), or PIPEDA principles
(e.g. "PIPEDA Principle 3 — Consent") where directly relevant to the score given.

REGULATORY REFERENCE MATERIAL:
${REGULATORY_CONTEXT}

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

IMPORTANT: Cite specific framework clauses in your recommendations. Examples:
- "Appoint an AI owner per NIST AI RMF GOVERN 1.2"
- "Complete a Privacy Impact Assessment per PIPEDA Principle 1 and ISO 42001 Clause 8.4"
- "Implement human override mechanism per NIST AI RMF MANAGE 2.2 and ISO 42001 Annex A.8.3"
- "Conduct bias testing per NIST AI RMF MEASURE 2.5 and ISO 42001 Annex A.9.3"

Keep each item concise (max 20 words including framework citation). Max 4 red flags, 5 immediate actions, 5 longer-term actions.

REGULATORY REFERENCE MATERIAL:
${REGULATORY_CONTEXT}`;

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

// ─── Main Orchestration Function ────────────────────────────────────────────────

export async function runAssessmentPipeline(
  input: WizardInput
): Promise<AssessmentResult> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const orchestratorSummary = await orchestratorAgent(input);
  const criterionScores = await riskAssessorAgent(input, orchestratorSummary);

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

  const controls = await controlsAdvisorAgent(input, criterionScores);
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
