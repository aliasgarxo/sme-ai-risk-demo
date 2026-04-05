/**
 * SME AI Risk — Multi-Agent System
 *
 * Agent pipeline:
 *  1. Orchestrator    — validates and summarises wizard input
 *  2. Risk Assessor   — scores each of 6 criteria 1–10 against the rubric
 *  3. Controls Advisor — produces red flags, immediate and longer-term actions
 *  4. Guidance Writer  — writes plain-language executive summary for the SME owner
 *  5. Validation Agent — checks score consistency; assigns per-criterion confidence
 *
 * Regulatory grounding: NIST AI RMF 1.0, ISO/IEC 42001:2023, PIPEDA, GDPR, EU AI Act
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

function extractJSON(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  return text.slice(start, end + 1);
}

// ─── Regulatory Reference Context ────────────────────────────────────────────
// Authoritative excerpts from five frameworks injected into agent system prompts.
// Agents are instructed to cite specific clause IDs in every score rationale
// and recommendation — no vector DB required at MVP scale.

const REGULATORY_CONTEXT = `
=== NIST AI RISK MANAGEMENT FRAMEWORK (AI RMF 1.0) ===

GOVERN — Establish policies, processes, and accountability:
- GOVERN 1.1: Policies and practices exist for AI risk identification, classification, and management.
- GOVERN 1.2: Accountability designations for AI risk management are clear (AI owner, product manager, legal, HR).
- GOVERN 1.3: Organisational teams understand their specific AI risk management roles.
- GOVERN 1.6: Policies cover AI risk management throughout the AI lifecycle.
- GOVERN 2.2: Organisational AI risk tolerance is determined and communicated.
- GOVERN 4.1: Teams are committed to transparent, accountable, and explainable AI practices.
- GOVERN 5.1: Policies address AI vendor relationships and supply chain risk.
- GOVERN 6.1: Policies exist for engaging affected communities and users.

MAP — Identify and classify AI risks:
- MAP 1.1: Context established for AI risk assessment (intended use, purpose, stakeholders, environment).
- MAP 1.5: Organisational risk priorities, tolerance, and legal/regulatory requirements are identified.
- MAP 1.6: Model transparency and explainability practices are in place.
- MAP 3.5: Risks to individuals, groups, and society are identified and prioritised.
- MAP 5.1: Likelihood and magnitude of each risk are estimated and documented.

MEASURE — Analyse and assess AI risks:
- MEASURE 1.1: Approaches and metrics for AI risk assessment are established.
- MEASURE 2.2: AI systems are evaluated regularly for trustworthiness and performance.
- MEASURE 2.5: Effectiveness in minimising negative impacts is evaluated (equity, bias, privacy).
- MEASURE 2.6: Performance and risk evaluated for known failure modes and edge cases.
- MEASURE 2.10: Privacy risk of the AI system is examined and documented.
- MEASURE 4.1: Metrics for risk tolerance, residual risk, and risk response are established.

MANAGE — Prioritise and address AI risks:
- MANAGE 1.1: A process exists for triaging and addressing AI risks.
- MANAGE 1.3: Responses to identified risks are planned, monitored, and documented.
- MANAGE 2.2: Mechanisms allow affected individuals to report concerns about AI outputs.
- MANAGE 2.4: Risk treatments (sharing, transfer, avoidance, acceptance) are documented.
- MANAGE 3.1: AI risks and benefits are communicated to relevant stakeholders.
- MANAGE 4.1: Post-deployment AI risk management activities are monitored and documented.

=== ISO/IEC 42001:2023 — AI MANAGEMENT SYSTEM ===

- Clause 4: Understand internal/external issues and stakeholder needs relevant to AI use.
- Clause 6.1.2: Carry out an AI risk assessment: identify, analyse, and evaluate AI-specific risks.
- Clause 6.1.3: Establish AI risk treatment options; implement controls; maintain a risk treatment plan.
- Clause 8.4: Perform AI impact assessments covering fundamental rights, safety, privacy, and fairness.
- Clause 8.5: Implement data governance controls for AI (data quality, provenance, appropriateness).
- Clause 8.6: Implement controls for AI system design (transparency, explainability, robustness).
- Clause 8.7: Implement controls for AI system operation (monitoring, human oversight, incident response).
- Clause 9.1: Monitor, measure, analyse, and evaluate AI management system performance.
- Annex A.2.2: Policies for responsible AI development and deployment.
- Annex A.3.3: AI awareness and training for all relevant staff.
- Annex A.4.3: Roles and responsibilities for AI risk management.
- Annex A.6.1: System impact assessment before deployment.
- Annex A.7.4: Transparency and explainability requirements for AI outputs.
- Annex A.8.3: Human oversight and intervention mechanisms.
- Annex A.8.5: Logging and monitoring of AI system behaviour.
- Annex A.9.3: Bias and fairness evaluation for AI systems.

=== PIPEDA — PERSONAL INFORMATION PROTECTION AND ELECTRONIC DOCUMENTS ACT (CANADA) ===

10 Fair Information Principles:
- Principle 1 Accountability: Designate a person responsible for PIPEDA compliance.
- Principle 2 Identifying Purposes: Identify purposes for personal information collection before or at collection time.
- Principle 3 Consent: Knowledge and consent required for collection, use, or disclosure of personal information.
- Principle 4 Limiting Collection: Collect only information necessary for identified purposes (data minimisation).
- Principle 5 Limiting Use/Disclosure/Retention: Use or disclose only for original purpose; retain only as long as necessary.
- Principle 6 Accuracy: Personal information must be accurate, complete, and up-to-date.
- Principle 7 Safeguards: Protect personal information with security safeguards appropriate to its sensitivity.
- Principle 8 Openness: Make privacy policies and practices readily available.
- Principle 9 Individual Access: Inform individuals of existence, use, and disclosure of their personal information upon request.
- Principle 10 Challenging Compliance: Individuals can challenge an organisation's PIPEDA compliance.

Key PIPEDA AI obligations:
- Automated decision-making using personal data requires clear legal basis and disclosure to affected individuals.
- Consent must be meaningful; individuals must understand what they are agreeing to.
- Sensitive data (health, financial, biometric) requires higher protection and explicit consent.
- Data breach notification required to OPC and affected individuals when there is real risk of significant harm.
- Privacy Impact Assessments (PIAs) recommended before deploying AI systems that handle personal information.

=== EU AI ACT (2024) ===

Risk Classification:
- Annex III (Article 6): Employment/recruitment AI — resume screening, candidate ranking, promotion decisions — is explicitly HIGH-RISK under the EU AI Act.
- High-risk AI systems face mandatory compliance requirements before deployment in EU markets or when processing EU residents' data.
- Canadian SMEs processing EU residents' data are subject to the EU AI Act's extraterritorial reach.

Key Articles for High-Risk AI:
- Article 9: Implement a risk management system throughout the AI lifecycle; identify, analyse, and mitigate foreseeable risks.
- Article 10: Data governance — training data must be relevant, representative, free of errors; bias must be identified and corrected.
- Article 13: Transparency — deployers must inform affected individuals they are subject to a high-risk AI system decision.
- Article 14: Human oversight — technical measures must enable human monitoring, intervention, and override of AI outputs in real time.
- Article 15: Accuracy, robustness, and cybersecurity — systems must achieve appropriate accuracy and be resilient to errors and adversarial inputs.
- Article 29: Deployers must conduct a fundamental rights impact assessment before deploying high-risk AI in employment decisions.
- Article 61: Post-market monitoring — deployers must monitor performance and report serious incidents to national authorities.

=== GDPR — GENERAL DATA PROTECTION REGULATION (EU 2016/679) ===

Key Articles relevant to AI systems processing personal data of EU/UK residents:
- Article 5: Principles — lawfulness, fairness, transparency; purpose limitation; data minimisation; accuracy; storage limitation; integrity and confidentiality.
- Article 6: Lawful basis — automated processing of personal data requires a valid legal basis (consent, legitimate interests, contract, legal obligation).
- Article 13-14: Transparency — data subjects must be informed about automated decision-making logic at the time of data collection.
- Article 17: Right to erasure — individuals can request deletion of personal data used in AI training or past decisions.
- Article 22: Automated decision-making — individuals have the right NOT to be subject to solely automated decisions that significantly affect them; human review must be available on request.
- Article 25: Data protection by design and default — privacy measures must be built into AI systems from the design stage.
- Article 35: DPIA mandatory for AI systems that perform systematic profiling, process sensitive data, or evaluate personal aspects at large scale.
- Recital 71: Individuals subject to automated profiling must receive an explanation of the decision and have the right to contest it.

Note: GDPR applies to any Canadian SME processing personal data of EU or UK residents, regardless of the SME's physical location.
`;

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
      .map((b) => `  - Score ${b.min}-${b.max} (${b.label}): ${b.description}`)
      .join("\n");
    return `\n=== ${c.name} (weight: ${c.weight}%) ===\n${bands}`;
  }).join("\n");

  const systemPrompt = `You are the Risk Assessor Agent for an SME AI Risk Assessment system.
Assign a numerical risk score from 1 to 10 (in 0.5 increments) for each of the 6 criteria.
Score 1 = lowest risk, Score 10 = highest risk.

Use ONLY the evidence from the system description. Be precise and evidence-based.
Apply the scoring rubric exactly. Use half-steps when more accurate than whole numbers.
In your rationale (1 sentence per criterion), cite at least one specific clause:
- NIST AI RMF: e.g. GOVERN 1.2, MEASURE 2.5, MANAGE 2.2
- ISO 42001: e.g. ISO 42001 Clause 8.4, Annex A.8.3
- PIPEDA: e.g. PIPEDA Principle 3 Consent
- EU AI Act: e.g. EU AI Act Article 14, Annex III
- GDPR: e.g. GDPR Article 22, Article 35

SCORING RUBRIC:
${rubricText}

REGULATORY REFERENCE MATERIAL:
${REGULATORY_CONTEXT}

Output ONLY valid JSON (no markdown, no extra text):
{
  "scores": [
    {"id": "human_oversight", "score": 4.5, "rationale": "one sentence with clause citation"},
    {"id": "data_privacy", "score": 7.0, "rationale": "one sentence with clause citation"},
    {"id": "transparency", "score": 5.5, "rationale": "one sentence with clause citation"},
    {"id": "robustness", "score": 3.0, "rationale": "one sentence with clause citation"},
    {"id": "non_discrimination", "score": 6.0, "rationale": "one sentence with clause citation"},
    {"id": "accountability", "score": 4.0, "rationale": "one sentence with clause citation"}
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

Score each of the 6 criteria now.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const text = (response.content[0] as { text: string }).text.trim();
  const parsed = JSON.parse(extractJSON(text));
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
      return `- ${def?.name ?? s.id}: ${s.score}/10 (${level}) -- ${s.rationale}`;
    })
    .join("\n");

  const systemPrompt = `You are the Controls Advisor Agent for an SME AI Risk Assessment system.
Based on the risk scores, identify:
1. Red Flags: critical issues requiring immediate attention (score 7+)
2. Immediate Actions: what the SME must do NOW within 30 days
3. Longer-Term Actions: what to plan for within 6 months
4. Confidence score (0-100): how complete and reliable this assessment is given the evidence quality

Cite specific framework clauses in every recommendation. Examples:
- Appoint an AI owner per NIST AI RMF GOVERN 1.2 and ISO 42001 Annex A.4.3
- Complete a Privacy Impact Assessment per PIPEDA Principle 1 and ISO 42001 Clause 8.4
- Implement human override mechanism per NIST AI RMF MANAGE 2.2, ISO 42001 Annex A.8.3, and EU AI Act Article 14
- Conduct bias testing per NIST AI RMF MEASURE 2.5, ISO 42001 Annex A.9.3, and EU AI Act Article 10
- Enable audit logging per ISO 42001 Annex A.8.5 and GDPR Article 5

Keep each item concise (max 25 words including citation). Max 4 red flags, 5 immediate actions, 5 longer-term actions.

REGULATORY REFERENCE MATERIAL:
${REGULATORY_CONTEXT}

Output ONLY valid JSON:
{
  "redFlags": ["...", "..."],
  "immediateActions": ["...", "..."],
  "longerTermActions": ["...", "..."],
  "confidenceScore": 75
}`;

  const userPrompt = `AI Tool: ${input.toolName} -- ${input.useCase}
Department: ${input.department}
Geographic Scope: ${input.geographicScope}

Risk Scores:
${scoresText}

Error Consequences: ${input.errorConsequence}
Third-party Sharing: ${input.thirdPartySharing}

Generate controls and recommendations now.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 900,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const text = (response.content[0] as { text: string }).text.trim();
  return JSON.parse(extractJSON(text)) as ControlsOutput;
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
Produce a clear, jargon-free executive summary for a non-technical SME owner.
Write in plain English. Be direct and encouraging. Max 180 words.
Structure: 1 sentence on overall risk level, 2-3 sentences on what that means in practice,
1-2 sentences on the single most important next step.`;

  const userPrompt = `AI Tool: "${input.toolName}" used for ${input.purpose} in the ${input.department} department.
Overall Risk Score: ${overallScore}/10 -- ${riskLevel} RISK
Geographic Scope: ${input.geographicScope}

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

// ─── Agent 5: Validation Agent ────────────────────────────────────────────────

interface ValidationOutput {
  criterionConfidences: Record<string, number>;
  consistencyIssues: string[];
}

async function validationAgent(
  criterionScores: CriterionScore[]
): Promise<ValidationOutput> {
  const scoresText = criterionScores
    .map((s) => {
      const def = SCORING_CRITERIA.find((c) => c.id === s.id);
      return `- ${def?.name ?? s.id} (id: ${s.id}): score=${s.score}, rationale="${s.rationale}"`;
    })
    .join("\n");

  const systemPrompt = `You are the Validation Agent for an SME AI Risk Assessment system.
Your job is to review all 6 criterion scores for:
1. Evidence quality: how well does the rationale actually support the score given?
2. Internal consistency: are the scores logically consistent with each other?
   Examples of inconsistencies:
   - Human Oversight is High risk but Accountability is Low risk (unlikely -- poor oversight implies poor governance)
   - Transparency is Low risk but Accountability is High risk (contradicts -- transparent systems are usually well-governed)
   - Data Privacy is High risk but Non-Discrimination is Low risk when biased training data is involved

For each criterion, assign a confidence score 0-100 based on how well the evidence in the rationale supports the score:
- 90-100: Strong evidence explicitly stated, clear mapping to score band
- 70-89: Reasonable evidence, minor ambiguity
- 50-69: Limited evidence, score is plausible but uncertain
- Below 50: Insufficient evidence to justify this score confidently

Output ONLY valid JSON:
{
  "criterionConfidences": {
    "human_oversight": 85,
    "data_privacy": 70,
    "transparency": 80,
    "robustness": 60,
    "non_discrimination": 75,
    "accountability": 90
  },
  "consistencyIssues": ["optional short note if scores are inconsistent", "another note if needed"]
}

If scores are fully consistent, return an empty array for consistencyIssues.`;

  const userPrompt = `Review these criterion scores for evidence quality and internal consistency:

${scoresText}

Return per-criterion confidence scores and any consistency issues.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const text = (response.content[0] as { text: string }).text.trim();
  return JSON.parse(extractJSON(text)) as ValidationOutput;
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

  // Agent 3: Controls and recommendations (run before validation so scores are available)
  const controls = await controlsAdvisorAgent(input, criterionScores);

  // Agent 5: Validate scores and get per-criterion confidence
  const validation = await validationAgent(criterionScores);

  // Build criterion results with per-criterion confidence merged in
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
      confidence: validation.criterionConfidences[cs.id],
    };
  });

  const overallScore = calculateOverallScore(criteriaResults);
  const overallRiskLevel = scoreToRiskLevel(overallScore);

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
    consistencyIssues: validation.consistencyIssues,
    createdAt,
  };
}
