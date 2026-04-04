"use client";

import { FileText, CheckCircle2, BookOpen } from "lucide-react";

const FRAMEWORKS = [
  {
    id: "nist",
    name: "NIST AI RMF 1.0",
    description: "GOVERN, MAP, MEASURE, MANAGE functions with sub-category clauses (e.g. GOVERN 1.2, MEASURE 2.5).",
    coverage: "32 sub-categories",
    status: "Active",
  },
  {
    id: "iso",
    name: "ISO/IEC 42001:2023",
    description: "AI Management System standard: Clauses 4–10 and Annex A controls (e.g. Clause 8.4, Annex A.8.3).",
    coverage: "Clauses 4–10 + 9 Annex A controls",
    status: "Active",
  },
  {
    id: "pipeda",
    name: "PIPEDA (Canada)",
    description: "10 Fair Information Principles plus AI-specific obligations for automated decision-making and consent.",
    coverage: "10 principles + AI obligations",
    status: "Active",
  },
  {
    id: "euai",
    name: "EU AI Act (2024)",
    description: "Risk classification, high-risk AI requirements (Articles 9, 10, 13, 14, 15, 29, 61) including Annex III employment AI.",
    coverage: "Articles 6, 9–15, 29, 61 + Annex III",
    status: "Active",
  },
  {
    id: "gdpr",
    name: "GDPR (EU 2016/679)",
    description: "Articles 5, 6, 13–14, 17, 22, 25, 35 and Recital 71 covering automated decision-making and data subject rights.",
    coverage: "8 articles + Recital 71",
    status: "Active",
  },
];

export function KnowledgeBase() {
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <h3 className="mb-1 font-semibold text-blue-900">Inline Regulatory Context</h3>
            <p className="text-sm text-blue-800">
              All five regulatory frameworks are embedded directly in the agent system prompts.
              Each agent is instructed to cite specific clause IDs in every score rationale and
              recommendation — no vector database is required at this scale. The authoritative text
              below is what each agent sees during an assessment.
            </p>
          </div>
        </div>
      </div>

      {/* Framework cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FRAMEWORKS.map((fw) => (
          <div
            key={fw.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="rounded-lg bg-red-50 p-2">
                <FileText className="h-5 w-5 text-canada-red" />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                <CheckCircle2 className="h-3 w-3" /> {fw.status}
              </span>
            </div>
            <h4 className="mb-1 font-bold text-gray-900">{fw.name}</h4>
            <p className="mb-3 text-xs text-gray-500 leading-relaxed">{fw.description}</p>
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
              Coverage: {fw.coverage}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center pt-2">
        Framework content is compiled from publicly available specification documents.
        Agents cite specific clause IDs; review agent rationale on any Results page to verify citations.
      </p>
    </div>
  );
}
