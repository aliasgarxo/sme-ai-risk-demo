"use client";

import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  AlertOctagon,
  Download,
  ArrowLeft,
  ShieldAlert,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";
import type { AssessmentResult, RiskLevel } from "@/lib/scoring";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function riskColor(level: RiskLevel) {
  return {
    High: { bg: "bg-red-50", border: "border-red-400", text: "text-red-700", badge: "bg-red-100 text-red-700", bar: "bg-red-500" },
    Medium: { bg: "bg-amber-50", border: "border-amber-400", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", bar: "bg-amber-400" },
    Low: { bg: "bg-green-50", border: "border-green-400", text: "text-green-700", badge: "bg-green-100 text-green-700", bar: "bg-green-500" },
  }[level];
}

function ScoreGauge({ score }: { score: number }) {
  const pct = ((score - 1) / 9) * 100; // 1–10 → 0–100%
  const level: RiskLevel = score <= 3.5 ? "Low" : score <= 6.5 ? "Medium" : "High";
  const colors = riskColor(level);

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4 flex h-36 w-36 items-center justify-center">
        <svg className="-rotate-90" width="144" height="144" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r="60" fill="none" stroke="#e5e7eb" strokeWidth="14" />
          <circle
            cx="72"
            cy="72"
            r="60"
            fill="none"
            strokeWidth="14"
            strokeDasharray={`${2 * Math.PI * 60}`}
            strokeDashoffset={`${2 * Math.PI * 60 * (1 - pct / 100)}`}
            className={clsx(
              "transition-all duration-1000",
              level === "High" ? "stroke-red-500" : level === "Medium" ? "stroke-amber-400" : "stroke-green-500"
            )}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={clsx("text-4xl font-black", colors.text)}>{score.toFixed(1)}</span>
          <span className="text-xs font-medium text-gray-400">/ 10</span>
        </div>
      </div>
      <span
        className={clsx(
          "rounded-full px-4 py-1.5 text-sm font-bold",
          colors.badge
        )}
      >
        {level === "High" ? "High Risk" : level === "Medium" ? "Medium Risk" : "Low Risk"}
      </span>
    </div>
  );
}

function confidenceColor(conf: number) {
  if (conf >= 80) return "bg-green-100 text-green-700";
  if (conf >= 60) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function CriterionCard({ criterion }: { criterion: AssessmentResult["criteria"][0] }) {
  const [expanded, setExpanded] = useState(false);
  const colors = riskColor(criterion.riskLevel);
  const barPct = ((criterion.score - 1) / 9) * 100;

  return (
    <div className={clsx("rounded-xl border-2 p-5 transition-all", colors.border, colors.bg)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900">{criterion.name}</span>
            <span className={clsx("rounded-full px-2 py-0.5 text-xs font-semibold", colors.badge)}>
              {criterion.riskLevel}
            </span>
            {criterion.confidence != null && (
              <span className={clsx("rounded-full px-2 py-0.5 text-xs font-medium", confidenceColor(criterion.confidence))}>
                {criterion.confidence}% confidence
              </span>
            )}
          </div>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className={clsx("h-full rounded-full", colors.bar)}
                initial={{ width: 0 }}
                animate={{ width: `${barPct}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
              />
            </div>
            <span className={clsx("text-sm font-black", colors.text)}>
              {criterion.score.toFixed(1)}/10
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Weight: {criterion.weight}% &nbsp;·&nbsp; Weighted contribution:{" "}
            {criterion.weightedScore.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 rounded-lg p-1 text-gray-400 hover:text-gray-700"
          aria-label="Toggle rationale"
        >
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-3 border-t border-current border-opacity-20 pt-3 text-sm text-gray-700">
              <span className="font-semibold">Agent rationale:</span> {criterion.rationale}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PDF Download ─────────────────────────────────────────────────────────────

async function downloadPDF(result: AssessmentResult) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFillColor(220, 38, 38); // canada-red
  doc.rect(0, 0, pageW, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("SME AI Risk Assessment Report", 14, 9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date(result.createdAt).toLocaleDateString("en-CA")}`, pageW - 14, 9, { align: "right" });

  y = 24;
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(result.toolName, 14, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(`Department: ${result.department}  |  Use Case: ${result.useCase}  |  Date: ${new Date(result.createdAt).toLocaleDateString("en-CA")}`, 14, y);
  y += 12;

  // Overall Score band
  const scoreColor: [number, number, number] =
    result.overallRiskLevel === "High"
      ? [239, 68, 68]
      : result.overallRiskLevel === "Medium"
      ? [251, 191, 36]
      : [34, 197, 94];

  doc.setFillColor(...scoreColor);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.roundedRect(14, y, pageW - 28, 12, 3, 3, "F");
  doc.text(
    `Overall Risk Score: ${result.overallScore.toFixed(1)} / 10  —  ${result.overallRiskLevel.toUpperCase()} RISK  |  Confidence: ${result.confidenceScore}%`,
    pageW / 2,
    y + 7.5,
    { align: "center" }
  );
  y += 18;

  // Executive Summary
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  const summaryLines = doc.splitTextToSize(result.summary, pageW - 28);
  doc.text(summaryLines, 14, y);
  y += summaryLines.length * 4.5 + 8;

  // Criterion scores table
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Risk Scoring by Criterion", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Criterion", "Weight", "Score", "Risk Level", "Rationale"]],
    body: result.criteria.map((c) => [
      c.name,
      `${c.weight}%`,
      `${c.score.toFixed(1)} / 10`,
      c.riskLevel,
      c.rationale,
    ]),
    headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [55, 65, 81] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 36 },
      1: { cellWidth: 16, halign: "center" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 80 },
    },
    didDrawCell: (data) => {
      if (data.column.index === 3 && data.section === "body") {
        const val = data.cell.raw as string;
        const [r, g, b]: [number, number, number] =
          val === "High" ? [254, 226, 226] : val === "Medium" ? [254, 243, 199] : [220, 252, 231];
        doc.setFillColor(r, g, b);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "F");
        doc.setTextColor(
          val === "High" ? 185 : val === "Medium" ? 146 : 22,
          val === "High" ? 28 : val === "Medium" ? 64 : 101,
          val === "High" ? 28 : val === "Medium" ? 3 : 52
        );
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(val, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: "center" });
      }
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  const addList = (title: string, items: string[], color: [number, number, number]) => {
    if (items.length === 0) return;
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...color);
    doc.text(title, 14, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    items.forEach((item) => {
      const lines = doc.splitTextToSize(`• ${item}`, pageW - 30);
      doc.text(lines, 18, y);
      y += lines.length * 4.5;
    });
    y += 5;
  };

  addList("🚨  Red Flags", result.redFlags, [185, 28, 28]);
  addList("⚡  Immediate Actions (within 30 days)", result.immediateActions, [146, 64, 14]);
  addList("📋  Longer-Term Actions (within 6 months)", result.longerTermActions, [21, 128, 61]);

  // Footer
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `SME AI Risk Watch  |  Page ${i} of ${totalPages}  |  Confidential — for internal use only`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  doc.save(`AI_Risk_Report_${result.toolName.replace(/\s+/g, "_")}_${new Date(result.createdAt).toISOString().slice(0, 10)}.pdf`);
}

// ─── Main Results Page ────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id) {
      const stored = JSON.parse(localStorage.getItem("assessments") || "[]") as AssessmentResult[];
      const found = stored.find((a) => a.id === id);
      if (found) {
        setResult(found);
        return;
      }
    }

    // Fallback: load latest
    const latest = localStorage.getItem("latestAssessment");
    if (latest) {
      setResult(JSON.parse(latest));
    } else {
      setNotFound(true);
    }
  }, []);

  if (notFound) {
    return (
      <div className="min-h-screen bg-zinc-50 pb-20">
        <Navbar />
        <div className="container mx-auto max-w-3xl px-4 pt-20 text-center">
          <Info className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h1 className="mb-3 text-2xl font-bold text-gray-900">No Assessment Found</h1>
          <p className="mb-8 text-gray-500">
            It looks like there is no completed assessment to display.
          </p>
          <Link
            href="/wizard"
            className="inline-flex items-center gap-2 rounded-full bg-canada-red px-8 py-3 font-bold text-white hover:bg-red-700"
          >
            Start New Assessment
          </Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-canada-red" />
      </div>
    );
  }

  const colors = riskColor(result.overallRiskLevel);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <Navbar />

      <div className="container mx-auto max-w-5xl px-4 pt-12">
        <Link
          href="/dashboard"
          className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-canada-red"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{result.toolName}</h1>
              <p className="mt-1 text-gray-500">
                {result.department} &nbsp;·&nbsp; {result.useCase} &nbsp;·&nbsp;{" "}
                {new Date(result.createdAt).toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={() => downloadPDF(result)}
              className="flex items-center gap-2 rounded-xl bg-canada-red px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
            >
              <Download className="h-4 w-4" /> Download Report
            </button>
          </div>
        </motion.div>

        {/* ── Score Summary ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={clsx(
            "mb-8 rounded-2xl border-2 p-8 shadow-lg",
            colors.border,
            colors.bg
          )}
        >
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <ScoreGauge score={result.overallScore} />
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className={clsx("text-xl font-bold", colors.text)}>Executive Summary</span>
                <span
                  className={clsx(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    colors.badge
                  )}
                >
                  Confidence: {result.confidenceScore}%
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">{result.summary}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Red Flags ── */}
        {result.redFlags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 rounded-2xl border-2 border-red-300 bg-red-50 p-6"
          >
            <div className="mb-4 flex items-center gap-3 text-red-700">
              <ShieldAlert className="h-6 w-6 shrink-0" />
              <h2 className="text-lg font-bold">Red Flags Identified</h2>
            </div>
            <ul className="space-y-2">
              {result.redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-red-800">
                  <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* ── Consistency Issues (Validation Agent) ── */}
        {result.consistencyIssues && result.consistencyIssues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mb-8 rounded-2xl border-2 border-amber-300 bg-amber-50 p-6"
          >
            <div className="mb-3 flex items-center gap-3 text-amber-700">
              <Info className="h-5 w-5 shrink-0" />
              <h2 className="text-sm font-bold uppercase tracking-wide">Validation Notes</h2>
            </div>
            <ul className="space-y-1.5">
              {result.consistencyIssues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 mt-2" />
                  {issue}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* ── Criteria Breakdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Risk Breakdown by Criterion</h2>
          <p className="mb-5 text-sm text-gray-500">
            Click the chevron on any card to see the agent&apos;s rationale and evidence confidence.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {result.criteria.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
              >
                <CriterionCard criterion={c} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Recommendations ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8 grid gap-6 md:grid-cols-2"
        >
          {/* Immediate Actions */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="mb-4 flex items-center gap-3 text-amber-700">
              <Clock className="h-5 w-5" />
              <h3 className="font-bold">Immediate Actions</h3>
              <span className="ml-auto rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800">
                Within 30 days
              </span>
            </div>
            <ul className="space-y-3">
              {result.immediateActions.map((action, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Longer-Term Actions */}
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
            <div className="mb-4 flex items-center gap-3 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <h3 className="font-bold">Longer-Term Actions</h3>
              <span className="ml-auto rounded-full bg-green-200 px-2 py-0.5 text-xs font-bold text-green-800">
                Within 6 months
              </span>
            </div>
            <ul className="space-y-3">
              {result.longerTermActions.map((action, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* ── Governance Artifacts ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="mb-5 text-2xl font-bold text-gray-900">Governance Artifacts</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Full Risk Report",
                desc: "Complete assessment with scores, evidence, and all recommendations.",
                color: "red",
                action: () => downloadPDF(result),
              },
              {
                title: "Risk Register Entry",
                desc: "Single-page summary of this AI use case for your risk register.",
                color: "blue",
                action: () => downloadPDF(result),
              },
              {
                title: "DPIA / TRA Summary",
                desc: "Data Protection Impact Assessment summary for privacy compliance.",
                color: "purple",
                action: () => downloadPDF(result),
              },
            ].map(({ title, desc, color, action }) => (
              <div
                key={title}
                className="flex flex-col items-center rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
              >
                <div
                  className={clsx(
                    "mb-4 rounded-full p-3",
                    color === "red"
                      ? "bg-red-100 text-canada-red"
                      : color === "blue"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-purple-100 text-purple-600"
                  )}
                >
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-center text-lg font-bold text-gray-900">{title}</h3>
                <p className="mb-6 text-center text-sm text-gray-500">{desc}</p>
                <button
                  onClick={action}
                  className="mt-auto flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
