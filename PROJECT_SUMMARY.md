# SME AI Risk Watch — Project Summary
### For Teammates: Report & Presentation Reference

---

## What Is This Project?

**SME AI Risk Watch** is a web application that helps small and medium-sized Canadian businesses (SMEs) understand and manage the risks of using AI tools in their operations.

Many SMEs are now using AI tools — like ChatGPT, hiring screening software, or finance automation — but they don't have dedicated legal or tech teams to evaluate whether those tools are safe, fair, or compliant with regulations. This app fills that gap.

A business owner fills out a simple 8-question form about their AI tool, and the app produces a full risk assessment report — with risk scores, red flags, recommended actions, and a plain-language summary — all grounded in real regulatory frameworks.

**Live Demo:** https://sme-ai-risk-demo.vercel.app/

---

## How the App Works (Full Flow)

```
User logs in
    ↓
Selects a Use Case (e.g. HR hiring tool, chatbot, finance monitoring)
    ↓
Fills in tool name + department
    ↓
Answers 8 questions about the AI system
    ↓
Clicks "Run Assessment"
    ↓
5 AI agents process the answers (takes ~20–40 seconds)
    ↓
Full risk report is shown: scores, red flags, actions, PDF download
    ↓
Report is saved in the browser and visible on the Dashboard
```

There is no database. Everything is saved in the browser's local storage.

---

## The 8 Questions (The Wizard)

The wizard collects information about the AI system being assessed. Here are all 8 questions:

| # | Question | What It's Asking |
|---|---|---|
| 1 | **AI System Purpose** | What does the AI actually do? (e.g. screen job applications, detect fraud) |
| 2 | **Data Sensitivity** | What kind of data does it process? (personal info, financial data, health records?) |
| 3 | **Decision Impact** | Does the AI make or influence real decisions that affect people? (e.g. reject a job applicant) |
| 4 | **Human Oversight** | Can a human review, question, or override what the AI decided? |
| 5 | **Transparency & Disclosure** | Are people told that an AI is making decisions about them? |
| 6 | **Consequence of Errors** | What's the worst thing that could happen if the AI gets it wrong? |
| 7 | **Third-Party & Data Sharing** | Is the data shared with external vendors or cloud platforms? |
| 8 | **Geographic Scope** | Where does the business operate? Which laws apply? (Canada, EU, etc.) |

> **Validation:** Answers must be at least 3 meaningful words / 15 characters. Gibberish or single-word answers are rejected before reaching the AI agents.

---

## The Knowledge Base — What Dataset Are We Using?

There is **no external database or dataset file**. Instead, the "knowledge base" is a set of **five real regulatory frameworks** that are written directly into the AI agents' instructions (system prompts). This means the agents already "know" the rules and can cite them when scoring.

### The 5 Regulatory Frameworks

| Framework | What It Is | Who It Applies To |
|---|---|---|
| **NIST AI RMF 1.0** | US National Institute of Standards — framework for governing AI risk across its full lifecycle (Govern, Map, Measure, Manage) | Any organisation using AI |
| **ISO/IEC 42001:2023** | International standard for managing AI systems responsibly — covers policies, risk assessment, data governance, human oversight | Any organisation globally |
| **PIPEDA** | Canada's federal privacy law — 10 Fair Information Principles for how personal data must be collected, used, and protected | Canadian businesses |
| **EU AI Act (2024)** | The world's first comprehensive AI law — classifies AI systems by risk level; employment/HR AI is explicitly labelled "high-risk" | Any business dealing with EU residents |
| **GDPR (EU 2016/679)** | EU data protection law — gives individuals rights over their data and requires businesses to be transparent about automated decisions | Any business processing EU resident data |

### How the Knowledge Base Is Integrated

Every agent in the pipeline has these regulatory texts embedded inside its instructions. When the Risk Assessor agent scores a criterion, it is required to **cite a specific clause** from one of these frameworks in its reasoning — for example:

- *"No human override mechanism exists — violates NIST AI RMF MANAGE 2.2 and EU AI Act Article 14"*
- *"Personal data shared with US vendor without a DPA — violates PIPEDA Principle 7 and GDPR Article 25"*

This means every score and every recommendation in the report is directly traceable to a real regulatory requirement — not a generic AI opinion.

---

## The Risk Scoring System

### Six Risk Criteria

The app scores the AI system across **6 criteria**, each weighted by importance:

| Criterion | Weight | What It Measures |
|---|---|---|
| **Data Privacy** | 25% | How sensitive is the data and how well is it protected? |
| **Human Oversight** | 20% | Can humans review, question, or override the AI? |
| **Transparency & Explainability** | 15% | Are people told about the AI, and can decisions be explained? |
| **Robustness & Reliability** | 15% | Does the AI handle errors and edge cases well? |
| **Fairness & Non-Discrimination** | 15% | Could the AI be biased against certain groups of people? |
| **Accountability & Governance** | 10% | Is there a clear owner, audit trail, and governance policy? |

### How Scores Work

- Each criterion is scored **1 to 10** (in 0.5 increments)
- **1 = lowest risk**, **10 = highest risk**
- Each score is multiplied by its weight to produce a **weighted overall score**
- The overall score falls into one of three risk bands:

| Score Range | Risk Level |
|---|---|
| 1.0 – 3.5 | 🟢 Low Risk |
| 4.0 – 6.5 | 🟡 Medium Risk |
| 7.0 – 10.0 | 🔴 High Risk |

### Confidence Scores

Each criterion also gets a **confidence percentage (0–100%)** — this tells the user how much evidence was in their answers to support the score. A low confidence score (e.g. 40%) means the user didn't provide enough detail for a reliable assessment.

---

## The 5 AI Agents — What They Do and Why

The assessment is not done by a single AI call. It uses a **pipeline of 5 specialised agents**, each with a specific job. This is called a multi-agent architecture.

---

### Agent 1 — Orchestrator
**Model:** Claude Sonnet 4.6 | **Token Limit:** 400

**What it does:** Reads all 8 answers from the wizard and produces a clean, structured summary of the AI system being assessed. It flags anything that seems vague, missing, or concerning before the scoring begins.

**Why it's used:** Acts as a quality gate. By summarising and structuring the raw input first, all downstream agents receive a consistent, well-organised picture of the system — rather than processing the raw form answers directly. Think of it as a "briefing note" for the other agents.

---

### Agent 2 — Risk Assessor
**Model:** Claude Sonnet 4.6 | **Token Limit:** 1500

**What it does:** This is the core scoring agent. It reads the Orchestrator's summary and all regulatory frameworks, then assigns a score from 1–10 to each of the 6 risk criteria. Every score must include a one-sentence rationale that cites a specific regulatory clause.

**Why it's used:** Separating the scoring into its own dedicated agent (rather than having one agent do everything) means it can apply the full scoring rubric carefully and reference the regulatory frameworks in detail. The 1500 token limit is intentionally high to allow thorough, evidence-based scoring.

---

### Agent 3 — Controls Advisor *(runs in parallel with Agent 5)*
**Model:** Claude Sonnet 4.6 | **Token Limit:** 900

**What it does:** Takes the risk scores from Agent 2 and produces three outputs:
1. **Red Flags** — critical issues requiring immediate attention (only for scores 7 or above)
2. **Immediate Actions** — what the business must do within 30 days
3. **Longer-Term Actions** — what to plan for within 6 months

Every recommendation cites a specific regulatory framework.

**Why it's used:** Scoring alone isn't actionable. A business owner needs to know *what to do*. By separating recommendations into their own agent, the advice is focused and practical rather than generic. The agent also produces a **confidence score** reflecting how reliable the overall assessment is given the quality of evidence provided.

---

### Agent 4 — Guidance Writer
**Model:** Claude Sonnet 4.6 | **Token Limit:** 300

**What it does:** Takes the overall risk score and top recommendations and writes a short, plain-language **executive summary** — written specifically for a non-technical business owner. No jargon, no legal language, just clear and direct.

**Why it's used:** Most SME owners are not AI experts or lawyers. The rest of the report (scores, citations, regulatory clauses) can be overwhelming. This agent translates everything into a 2–3 paragraph human-readable summary that any business owner can understand and act on.

---

### Agent 5 — Validation Agent *(runs in parallel with Agent 3)*
**Model:** Claude Haiku 4.5 | **Token Limit:** 400

**What it does:** Reviews all 6 scores from Agent 2 and checks two things:
1. **Evidence quality** — does the rationale actually justify the score given?
2. **Consistency** — do the scores make logical sense together? (e.g. a low Human Oversight score alongside a low Accountability score is plausible; but a high Transparency score alongside a high Accountability score might contradict each other)

It outputs a **per-criterion confidence score (0–100%)** and flags any inconsistencies.

**Why it's used:** AI models can sometimes hallucinate or be inconsistent. This agent acts as an internal audit layer — catching cases where a score looks unreliable or where two scores contradict each other. It also helps the business owner know how much to trust each individual score. A lighter (cheaper, faster) model — Haiku — is used here since this is a checking task, not a complex reasoning task.

---

## Why This Architecture (Multi-Agent)?

Instead of asking one AI to do everything, the pipeline uses specialised agents because:

- **Each agent is focused** — it does one job and does it well
- **Scores and recommendations are separate** — the risk assessor doesn't try to write recommendations; the controls advisor doesn't try to score
- **There's a validation layer** — a dedicated agent checks the other agents' work
- **Regulatory citations are enforced** — each agent is specifically instructed to cite frameworks, making the output traceable and academically grounded

---

## Tech Stack (Brief)

| Part | Technology |
|---|---|
| Frontend & Backend | Next.js (React) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI Models | Anthropic Claude (Sonnet 4.6 + Haiku 4.5) |
| PDF Export | jsPDF (client-side, no server needed) |
| Storage | Browser localStorage (no database) |
| Auth | Cookie-based (no third-party service) |
| Deployment | Vercel |

---

## What Was Built / Fixed During Development

| What | Description |
|---|---|
| Multi-agent pipeline | 5-agent assessment system with regulatory grounding |
| Scoring rubric | 6 criteria with 10-band rubric (0.5 increments) |
| Regulatory context | NIST, ISO 42001, PIPEDA, EU AI Act, GDPR embedded in agents |
| GDPR + EU AI Act | Added to the framework coverage |
| Validation Agent | Per-criterion confidence scoring + consistency checks |
| JSON parsing fix | Robust extraction to handle agent responses with extra text |
| Input validation | Blocks garbage/nonsense answers before reaching the agents |
| Auth cleanup | Removed Supabase; replaced with simple cookie-based auth |
| Contributor cleanup | Repository history cleaned up |

---

## Summary in One Paragraph

SME AI Risk Watch is a web app that helps Canadian small businesses assess the risks of their AI tools. A business owner fills in an 8-question form about their AI system, and a pipeline of 5 specialised AI agents processes the answers — scoring the system across 6 risk criteria, generating regulatory-grounded recommendations, and writing a plain-language summary. All scoring is tied to five real regulatory frameworks (NIST AI RMF, ISO 42001, PIPEDA, EU AI Act, GDPR) that are embedded directly into the agents' instructions. The result is a downloadable PDF risk report that any non-technical business owner can understand and act on — without needing a legal or AI governance team.
