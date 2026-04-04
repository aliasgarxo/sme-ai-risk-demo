# SME AI Risk Watch

**Live Demo:** https://sme-ai-risk-demo.vercel.app/

A multi-agent AI risk assessment tool for Canadian small and medium enterprises (SMEs). Built as a final academic project, it helps non-technical business owners assess the ethical, privacy, and governance risks of their AI tools — and receive actionable, regulation-grounded recommendations.

---

## What This Application Does

SME AI Risk Watch guides a business owner through an 8-question wizard about their AI system. A 5-agent pipeline then:

1. **Validates** the input and produces a structured summary
2. **Scores** 6 risk criteria on a 1–10 scale against a detailed rubric
3. **Recommends** immediate and longer-term controls with framework citations
4. **Writes** a plain-language executive summary for non-technical readers
5. **Validates** score consistency and assigns per-criterion evidence confidence

Results show an overall risk score, per-criterion breakdown, red flags, and a downloadable PDF report — all grounded in five regulatory frameworks.

---

## Regulatory Frameworks

Every score rationale and recommendation cites specific clauses from:

| Framework | Scope |
|---|---|
| **NIST AI RMF 1.0** | GOVERN, MAP, MEASURE, MANAGE functions (32 sub-categories) |
| **ISO/IEC 42001:2023** | AI Management System — Clauses 4–10 + Annex A controls |
| **PIPEDA** | 10 Fair Information Principles + AI-specific obligations |
| **EU AI Act (2024)** | High-risk AI classification (Annex III), Articles 9–15, 29, 61 |
| **GDPR (EU 2016/679)** | Articles 5, 6, 13–14, 17, 22, 25, 35, Recital 71 |

All regulatory text is embedded directly in the agent system prompts — no vector database is required at this scale.

---

## Scoring Model

Six weighted criteria, each scored 1–10 (0.5 increments) by the Risk Assessor agent against a 10-band rubric:

| Criterion | Weight | Focus |
|---|---|---|
| Data Privacy | 25% | Sensitivity of data and adequacy of privacy controls |
| Human Oversight | 20% | Ability to review, intervene, or override AI decisions |
| Transparency & Explainability | 15% | Disclosure to affected parties and explainability of decisions |
| Robustness & Reliability | 15% | Stability, error handling, and failure-mode resilience |
| Fairness & Non-Discrimination | 15% | Bias risk and fairness testing across protected groups |
| Accountability & Governance | 10% | Ownership, audit trails, and governance policy |

**Risk bands:** 1–3.5 = Low · 4–6.5 = Medium · 7–10 = High

---

## Architecture

```
Browser (Next.js App Router)
│
├── /wizard          8-question input form → POST /api/assess
├── /results         Reads assessment from localStorage, renders report
├── /dashboard       Assessment history (localStorage), metrics summary
├── /admin           Evaluation matrix, knowledge base, AI copilot
└── /login           Cookie-based auth (no external auth service)

Server (Next.js Route Handlers)
│
├── POST /api/assess → lib/agents.ts → 5-agent pipeline → AssessmentResult
└── POST /api/chat   → Anthropic Claude Haiku → conversational AI assistant

lib/
├── agents.ts        5-agent pipeline (Anthropic Claude SDK)
└── scoring.ts       Rubric definitions, score calculation, risk level mapping
```

### Agent Pipeline (`lib/agents.ts`)

```
Input (WizardInput)
    │
    ▼
Agent 1: Orchestrator (claude-sonnet-4-6, 400 tokens)
    Validates input, produces structured summary
    │
    ▼
Agent 2: Risk Assessor (claude-sonnet-4-6, 1500 tokens)
    Scores 6 criteria 1–10; cites NIST/ISO/PIPEDA/GDPR/EU AI Act clauses
    │
    ├──▶ Agent 3: Controls Advisor (claude-sonnet-4-6, 900 tokens)
    │        Red flags, immediate/longer-term actions with framework citations
    │
    └──▶ Agent 5: Validation Agent (claude-haiku-4-5, 400 tokens)
             Per-criterion confidence (0–100%) + consistency checks
    │
    ▼
Agent 4: Guidance Writer (claude-sonnet-4-6, 300 tokens)
    Plain-language executive summary for the SME owner
    │
    ▼
AssessmentResult → stored in browser localStorage → rendered on /results
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.2 (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| AI | Anthropic Claude (`claude-sonnet-4-6` for assessments, `claude-haiku-4-5` for chat) |
| PDF | jsPDF + jspdf-autotable (client-side) |
| Auth | Cookie-based (pure server-side, no external service) |
| Storage | Browser localStorage (no database) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

### Local Setup

```bash
git clone https://github.com/your-username/sme-ai-risk-demo.git
cd sme-ai-risk-demo
npm install
```

Create a `.env.local` file:

```env
ANTHROPIC_API_KEY=sk-ant-...

# Optional: override demo credentials (defaults shown)
ADMIN_EMAIL=admin@sme.com
ADMIN_PASSWORD=admin123
USER_EMAIL=demo@sme.com
USER_PASSWORD=demo123
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| User | demo@sme.com | demo123 |
| Admin | admin@sme.com | admin123 |

The Admin role additionally grants access to `/admin` (Evaluation Matrix, Knowledge Base, AI Copilot).

---

## Deployment (Vercel)

1. Push to GitHub and import the repo in [Vercel](https://vercel.com)
2. Add the following environment variable in **Vercel → Settings → Environment Variables**:
   - `ANTHROPIC_API_KEY` — your Anthropic API key
3. Deploy. No database setup required.

---

## Project Structure

```
sme-ai-risk-demo/
├── app/
│   ├── admin/           Admin dashboard (Evaluation Matrix, KB, Copilot)
│   ├── api/
│   │   ├── assess/      POST: runs 5-agent assessment pipeline
│   │   └── chat/        POST: AI chat assistant (Claude Haiku)
│   ├── dashboard/       Assessment history and metrics
│   ├── login/           Auth page + server actions
│   ├── results/         Assessment results and PDF download
│   ├── wizard/          8-question input wizard
│   └── layout.tsx       Root layout, fonts, Navbar
├── components/
│   ├── admin/
│   │   ├── AdminCopilot.tsx     AI assistant for admin
│   │   ├── EvaluationMatrix.tsx Scoring rubric viewer
│   │   └── KnowledgeBase.tsx    Regulatory framework reference
│   ├── ChatWidget.tsx           Floating AI chat assistant
│   ├── Hero.tsx                 Landing page hero
│   └── Navbar.tsx               Navigation with auth state
├── lib/
│   ├── agents.ts         Multi-agent pipeline + regulatory context
│   └── scoring.ts        Rubric definitions + score calculation
├── middleware.ts          Route protection (cookie-based)
└── utils/supabase/        Stub files (Supabase removed)
```

---

## Academic Context

This application was built as a final project for an academic program focused on AI governance and responsible AI adoption. The goal is to demonstrate how AI can be used to help non-technical SME owners understand and manage the risks of their own AI tool deployments — making compliance with NIST AI RMF, ISO 42001, PIPEDA, GDPR, and the EU AI Act accessible without requiring a dedicated legal or AI governance team.

The assessment pipeline is intentionally transparent: all regulatory citations reference real, publicly available framework documents. The per-criterion confidence scores and validation agent flag areas where the evidence provided in the wizard was insufficient to make a high-confidence scoring decision.
