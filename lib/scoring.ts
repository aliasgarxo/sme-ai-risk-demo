/**
 * SME AI Risk Scoring Engine
 * Score scale: 1–10 (1 = lowest risk, 10 = highest risk)
 * Risk bands: 1–3.5 = Low | 4–6.5 = Medium | 7–10 = High
 */

export type RiskLevel = "Low" | "Medium" | "High";

export interface ScoreBand {
  min: number;
  max: number;
  label: string;
  description: string;
}

export interface CriterionDefinition {
  id: string;
  name: string;
  weight: number; // percentage (must sum to 100)
  description: string;
  scoringRubric: ScoreBand[];
}

export interface CriterionResult {
  id: string;
  name: string;
  weight: number;
  score: number; // 1–10, 0.5 increments
  weightedScore: number;
  riskLevel: RiskLevel;
  rationale: string;
  recommendations: string[];
  confidence?: number; // 0–100, per-criterion evidence confidence
}

export interface AssessmentResult {
  id: string;
  toolName: string;
  department: string;
  useCase: string;
  overallScore: number; // 1–10
  overallRiskLevel: RiskLevel;
  confidenceScore: number; // 0–100%
  criteria: CriterionResult[];
  redFlags: string[];
  immediateActions: string[];
  longerTermActions: string[];
  summary: string;
  consistencyIssues?: string[]; // flagged by validation agent
  createdAt: string;
}

// ─── Scoring Rubric Definitions ───────────────────────────────────────────────

export const SCORING_CRITERIA: CriterionDefinition[] = [
  {
    id: "human_oversight",
    name: "Human Oversight",
    weight: 20,
    description: "Degree to which humans can review, intervene, or override AI decisions.",
    scoringRubric: [
      {
        min: 1,
        max: 1.5,
        label: "Full human control",
        description:
          "Every AI output is reviewed and approved by a human before any action is taken. Humans have complete override capability at any point. Formal sign-off procedures exist.",
      },
      {
        min: 2,
        max: 2.5,
        label: "Strong oversight",
        description:
          "Human review is required for all high-impact decisions. AI is used only as a recommendation tool. Clear escalation paths and override mechanisms are documented and tested.",
      },
      {
        min: 3,
        max: 3.5,
        label: "Regular oversight with exceptions",
        description:
          "Humans review most decisions; routine low-impact outputs may be automated. Periodic audits and spot-checks are in place. Override mechanism exists but may not be universally applied.",
      },
      {
        min: 4,
        max: 4.5,
        label: "Periodic oversight",
        description:
          "Human review occurs at scheduled intervals rather than per-decision. Some categories of decisions are fully automated. Audit logs exist but real-time intervention is limited.",
      },
      {
        min: 5,
        max: 5.5,
        label: "Limited structured oversight",
        description:
          "Oversight is present but inconsistent or informal. Humans are notified of key decisions but rarely intervene. No systematic review of automated outputs.",
      },
      {
        min: 6,
        max: 6.5,
        label: "Reactive oversight only",
        description:
          "Humans only get involved when errors are flagged by end-users or external parties. No proactive review mechanism. Override requires significant effort.",
      },
      {
        min: 7,
        max: 7.5,
        label: "Minimal oversight",
        description:
          "Mostly automated pipeline with oversight reserved for exceptional cases. Humans are rarely in the loop. Response to errors is slow and unstructured.",
      },
      {
        min: 8,
        max: 8.5,
        label: "Oversight in name only",
        description:
          "Oversight policy exists on paper but is not practiced. Staff lack tools or authority to meaningfully review AI decisions. No real intervention mechanism.",
      },
      {
        min: 9,
        max: 9.5,
        label: "No effective oversight",
        description:
          "AI operates autonomously with no meaningful human review. Errors propagate undetected. No formal mechanism to challenge or correct AI outputs.",
      },
      {
        min: 10,
        max: 10,
        label: "Fully autonomous — no oversight",
        description:
          "Completely unsupervised AI operation with consequential impacts. No audit trail, no override, no human accountability. Critical decisions made without any human awareness.",
      },
    ],
  },
  {
    id: "data_privacy",
    name: "Data Privacy",
    weight: 25,
    description: "Sensitivity of data processed and adequacy of privacy and security controls.",
    scoringRubric: [
      {
        min: 1,
        max: 1.5,
        label: "No personal data",
        description:
          "System processes only anonymised, aggregated, or fully public data. No PII of any kind. PIPEDA/privacy law obligations do not apply. No privacy risks present.",
      },
      {
        min: 2,
        max: 2.5,
        label: "Minimal non-sensitive data",
        description:
          "Very limited contact information or professional identifiers processed with strict need-to-know access. Comprehensive privacy policy in place. Retention limits enforced.",
      },
      {
        min: 3,
        max: 3.5,
        label: "Standard PII with strong controls",
        description:
          "Standard PII (names, emails, addresses) processed with documented lawful basis, encryption at rest and in transit, and regular privacy audits compliant with PIPEDA.",
      },
      {
        min: 4,
        max: 4.5,
        label: "PII with adequate controls",
        description:
          "PII processed with reasonable security measures. Privacy notices provided. Some gaps in data mapping or retention policy. Annual privacy review conducted.",
      },
      {
        min: 5,
        max: 5.5,
        label: "PII with partial controls",
        description:
          "PII processed but privacy controls are incomplete. Consent mechanisms exist but data minimisation is not fully applied. Security measures are basic.",
      },
      {
        min: 6,
        max: 6.5,
        label: "Sensitive PII with gaps",
        description:
          "Sensitive PII (financial, health-adjacent, employment) processed with notable gaps in compliance. Privacy assessment not completed. Data sharing with third parties not fully documented.",
      },
      {
        min: 7,
        max: 7.5,
        label: "Special category data with weak controls",
        description:
          "Special category data (health, biometric, racial, religious) processed without DPIA completed. Encryption is partial. Third-party data flows unclear. High PIPEDA non-compliance risk.",
      },
      {
        min: 8,
        max: 8.5,
        label: "High-risk data inadequately protected",
        description:
          "Highly sensitive data processed with inadequate technical or organisational controls. Data breach response plan absent. Data shared broadly with limited accountability.",
      },
      {
        min: 9,
        max: 9.5,
        label: "Critical data with near-absent controls",
        description:
          "Processing data that poses severe privacy risks (financial credentials, medical records, minors' data) with very poor controls. Active risk of harm if breached.",
      },
      {
        min: 10,
        max: 10,
        label: "Maximum privacy risk",
        description:
          "Most sensitive data categories processed with no meaningful privacy framework. No lawful basis identified. Known vulnerabilities unaddressed. Regulatory breach near-certain.",
      },
    ],
  },
  {
    id: "transparency",
    name: "Transparency & Explainability",
    weight: 15,
    description:
      "Clarity about how the AI system works, its limitations, and disclosure to affected parties.",
    scoringRubric: [
      {
        min: 1,
        max: 1.5,
        label: "Fully transparent",
        description:
          "Complete documentation of AI system logic, training data, known limitations, and performance metrics. Users are clearly informed AI is involved and can request explanations for decisions.",
      },
      {
        min: 2,
        max: 2.5,
        label: "Highly transparent",
        description:
          "System is well-documented internally. Users receive clear disclosure and can receive meaningful explanations for AI decisions. Explainability tools (e.g., LIME, SHAP) or equivalent summaries are used.",
      },
      {
        min: 3,
        max: 3.5,
        label: "Good transparency",
        description:
          "Clear disclosure to users. System documentation exists and is maintained. Explanations available upon request. Some technical opacity but mitigated by plain-language summaries.",
      },
      {
        min: 4,
        max: 4.5,
        label: "Moderate transparency",
        description:
          "Disclosure exists but not always prominent. Internal documentation is partial. Explanations offered at aggregate level but individual decision rationale not always accessible.",
      },
      {
        min: 5,
        max: 5.5,
        label: "Partial transparency",
        description:
          "Users may not be fully aware AI is involved. Limited documentation available. Explanations not readily accessible. Black-box elements present with no mitigation strategy.",
      },
      {
        min: 6,
        max: 6.5,
        label: "Limited transparency",
        description:
          "Minimal user disclosure. Internal documentation incomplete or outdated. No mechanism for users to query AI decisions. Lack of explainability not acknowledged as a risk.",
      },
      {
        min: 7,
        max: 7.5,
        label: "Poor transparency",
        description:
          "No meaningful disclosure to affected parties. Documentation absent or inaccessible. AI decisions are treated as final with no explanation pathway. System limitations not communicated.",
      },
      {
        min: 8,
        max: 8.5,
        label: "Very low transparency",
        description:
          "Users unaware AI is involved. No internal documentation. Decisions presented as human-made. Explainability not technically feasible with current stack and not planned.",
      },
      {
        min: 9,
        max: 9.5,
        label: "Opaque system",
        description:
          "Actively obscures AI involvement. No documentation at any level. System logic unknown even to operators. Any attempt to explain decisions would be speculative.",
      },
      {
        min: 10,
        max: 10,
        label: "Completely opaque — potentially deceptive",
        description:
          "Deliberately misleading about AI involvement. Complete black box with no traceability. Users and regulators cannot verify any aspect of system behaviour.",
      },
    ],
  },
  {
    id: "robustness",
    name: "Robustness & Reliability",
    weight: 15,
    description:
      "System stability, error handling, and resilience against incorrect, adversarial, or edge-case inputs.",
    scoringRubric: [
      {
        min: 1,
        max: 1.5,
        label: "Highly robust",
        description:
          "Extensive testing including adversarial and edge-case scenarios. Continuous performance monitoring with alerting. Known failure modes fully documented and mitigated. Incident response tested.",
      },
      {
        min: 2,
        max: 2.5,
        label: "Strong reliability",
        description:
          "Comprehensive testing suite covering functional and failure paths. Real-time monitoring in place. Documented incident response. Performance degradation detected and handled gracefully.",
      },
      {
        min: 3,
        max: 3.5,
        label: "Good reliability",
        description:
          "Regular regression testing. Monitoring dashboards active. Defined SLAs. Known failure modes documented with workarounds. Incidents reviewed post-event.",
      },
      {
        min: 4,
        max: 4.5,
        label: "Adequate reliability",
        description:
          "Basic test coverage. Monitoring exists but may miss edge cases. Incident response plan exists but not regularly rehearsed. Some known failure modes without full mitigations.",
      },
      {
        min: 5,
        max: 5.5,
        label: "Moderate reliability",
        description:
          "Testing done at development but not continuously. Monitoring is partial. System fails occasionally under load or unusual inputs. Error handling is inconsistent.",
      },
      {
        min: 6,
        max: 6.5,
        label: "Limited reliability",
        description:
          "Minimal automated testing. No continuous monitoring. Known bugs and failure modes unaddressed. Error handling is ad-hoc. System may fail silently.",
      },
      {
        min: 7,
        max: 7.5,
        label: "Low reliability",
        description:
          "Manual testing only. No monitoring. Failure modes undocumented. System regularly produces incorrect or unexpected outputs. No structured incident response.",
      },
      {
        min: 8,
        max: 8.5,
        label: "Poor reliability",
        description:
          "No systematic testing. No monitoring. System behaviour unpredictable in production. Errors may go undetected for extended periods. No recovery mechanism.",
      },
      {
        min: 9,
        max: 9.5,
        label: "Unreliable",
        description:
          "System known to produce frequent errors. No safety mechanisms. Failures cause cascading downstream issues. No version control or rollback capability.",
      },
      {
        min: 10,
        max: 10,
        label: "Critically unreliable",
        description:
          "System is fundamentally unstable. Catastrophic failure possible with no safeguards. No testing, monitoring, or incident response of any kind. Systemic harm from failures is likely.",
      },
    ],
  },
  {
    id: "non_discrimination",
    name: "Fairness & Non-Discrimination",
    weight: 15,
    description:
      "Risk that the AI system produces biased or discriminatory outcomes across protected groups.",
    scoringRubric: [
      {
        min: 1,
        max: 1.5,
        label: "Proven fairness",
        description:
          "Rigorous bias testing across all protected characteristics (age, gender, race, disability, etc.). Fairness metrics (equal opportunity, demographic parity) validated. Diverse and representative training data confirmed.",
      },
      {
        min: 2,
        max: 2.5,
        label: "Strong fairness posture",
        description:
          "Regular bias audits conducted. Fairness constraints embedded in model. Disaggregated performance metrics reviewed. Complaints process for discrimination available.",
      },
      {
        min: 3,
        max: 3.5,
        label: "Good fairness practices",
        description:
          "Bias testing performed at model launch. Protected characteristics not used as direct inputs. Training data reviewed for representation. Periodic re-evaluation planned.",
      },
      {
        min: 4,
        max: 4.5,
        label: "Basic fairness measures",
        description:
          "Some fairness considerations documented. Protected attributes excluded from direct model inputs. Informal checks conducted. No ongoing bias monitoring in production.",
      },
      {
        min: 5,
        max: 5.5,
        label: "Partial fairness awareness",
        description:
          "Awareness of fairness risks but limited action taken. Proxy discrimination risks (e.g., postal code for race) not fully assessed. No formal bias testing methodology.",
      },
      {
        min: 6,
        max: 6.5,
        label: "Fairness gaps present",
        description:
          "Known fairness risks not fully addressed. Proxy variables may introduce indirect discrimination. No disaggregated performance metrics. Complaints process unclear.",
      },
      {
        min: 7,
        max: 7.5,
        label: "Significant bias risk",
        description:
          "No bias testing conducted. Training data composition unknown. Protected characteristics may indirectly influence outcomes. Disparate impact possible and unmonitored.",
      },
      {
        min: 8,
        max: 8.5,
        label: "High discrimination risk",
        description:
          "No fairness considerations in design or deployment. Biased training data likely. Discriminatory patterns possible across multiple protected groups. No redress mechanism.",
      },
      {
        min: 9,
        max: 9.5,
        label: "Very high discrimination risk",
        description:
          "Model trained on historically biased data in high-stakes domain. Protected attributes may be directly or indirectly used. Harm to protected groups likely without intervention.",
      },
      {
        min: 10,
        max: 10,
        label: "Active discrimination likely",
        description:
          "Strong evidence or high probability that system produces discriminatory outcomes. Protected attributes used as inputs. No corrective action taken. Legal and ethical violations probable.",
      },
    ],
  },
  {
    id: "accountability",
    name: "Accountability & Governance",
    weight: 10,
    description:
      "Clarity of ownership, audit trails, compliance governance, and escalation processes.",
    scoringRubric: [
      {
        min: 1,
        max: 1.5,
        label: "Full accountability",
        description:
          "Named AI owner/DPO. Complete audit trails with tamper-proof logs. Board-level AI governance policy. Regular compliance reviews. Clear escalation and appeals process. Aligned with NIST AI RMF / ISO 42001.",
      },
      {
        min: 2,
        max: 2.5,
        label: "Strong governance",
        description:
          "Designated AI responsible person. Comprehensive audit logging. AI policy documented and communicated. Incident escalation process defined and tested. Regular governance reviews.",
      },
      {
        min: 3,
        max: 3.5,
        label: "Good governance",
        description:
          "Clear ownership assigned. Audit logs maintained. AI usage policy exists and is followed. Escalation process documented. Annual compliance review conducted.",
      },
      {
        min: 4,
        max: 4.5,
        label: "Adequate accountability",
        description:
          "Ownership assigned but not formally documented. Basic audit logging. Informal AI policy. Escalation process informally understood. Compliance reviewed when issues arise.",
      },
      {
        min: 5,
        max: 5.5,
        label: "Partial accountability",
        description:
          "Unclear ownership in some areas. Audit logs incomplete. AI policy in draft or not enforced. Escalation pathway unclear to most staff. No regular compliance review.",
      },
      {
        min: 6,
        max: 6.5,
        label: "Weak governance",
        description:
          "No formally designated AI owner. Audit trails absent or incomplete. No AI governance policy. Escalation defaults to generic IT helpdesk. Compliance not actively managed.",
      },
      {
        min: 7,
        max: 7.5,
        label: "Minimal accountability",
        description:
          "Accountability diffused across teams with no clear responsibility. No audit logging. No policy framework. Escalation pathway non-existent. Non-compliance risks accumulating.",
      },
      {
        min: 8,
        max: 8.5,
        label: "Absent governance",
        description:
          "No named owner. No audit trails. AI deployed without policy or approval. No escalation process. Regulatory exposure unmanaged.",
      },
      {
        min: 9,
        max: 9.5,
        label: "No accountability",
        description:
          "Complete accountability vacuum. AI deployed with no governance, no logging, no policy, and no escalation. No individual or team able to account for AI decisions.",
      },
      {
        min: 10,
        max: 10,
        label: "Total accountability failure",
        description:
          "Deliberate avoidance of accountability. No records, no responsible parties, no governance. Impossible to audit or challenge any AI decision. Regulatory penalties near-certain.",
      },
    ],
  },
];

// ─── Risk Level Mapping ────────────────────────────────────────────────────────

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score <= 3.5) return "Low";
  if (score <= 6.5) return "Medium";
  return "High";
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "Low":
      return "green";
    case "Medium":
      return "amber";
    case "High":
      return "red";
  }
}

export function getRiskBandLabel(score: number): string {
  if (score <= 2) return "Minimal Risk";
  if (score <= 3.5) return "Low Risk";
  if (score <= 5) return "Moderate Risk";
  if (score <= 6.5) return "Medium Risk";
  if (score <= 8) return "High Risk";
  return "Critical Risk";
}

// ─── Score Calculation ─────────────────────────────────────────────────────────

export function calculateOverallScore(criteria: CriterionResult[]): number {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = criteria.reduce(
    (sum, c) => sum + c.score * (c.weight / totalWeight),
    0
  );
  // Round to nearest 0.5
  return Math.round(weightedSum * 2) / 2;
}

export function getCriterionDefinition(id: string): CriterionDefinition | undefined {
  return SCORING_CRITERIA.find((c) => c.id === id);
}

export function getScoreBandForScore(
  criterion: CriterionDefinition,
  score: number
): ScoreBand | undefined {
  return criterion.scoringRubric.find((b) => score >= b.min && score <= b.max);
}
