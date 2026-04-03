"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Plus, FileText, AlertOctagon, AlertTriangle, CheckCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";
import type { AssessmentResult, RiskLevel } from "@/lib/scoring";

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
        level === "High" && "bg-red-100 text-red-700",
        level === "Medium" && "bg-amber-100 text-amber-700",
        level === "Low" && "bg-green-100 text-green-700"
      )}
    >
      {level === "High" && <AlertOctagon className="h-3 w-3" />}
      {level === "Medium" && <AlertTriangle className="h-3 w-3" />}
      {level === "Low" && <CheckCircle className="h-3 w-3" />}
      {level} Risk
    </span>
  );
}

export default function DashboardPage() {
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("assessments");
    if (stored) {
      try {
        setAssessments(JSON.parse(stored));
      } catch {
        setAssessments([]);
      }
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = assessments.filter((a) => a.id !== id);
    setAssessments(updated);
    localStorage.setItem("assessments", JSON.stringify(updated));
  };

  const highCount = assessments.filter((a) => a.overallRiskLevel === "High").length;
  const mediumCount = assessments.filter((a) => a.overallRiskLevel === "Medium").length;
  const lowCount = assessments.filter((a) => a.overallRiskLevel === "Low").length;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <Navbar />

      <div className="container mx-auto max-w-5xl px-4 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-wrap items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Assessments</h1>
            <p className="mt-1 text-gray-500">
              Manage AI risk assessments and compliance governance for your organisation.
            </p>
          </div>
          <Link
            href="/wizard"
            className="flex items-center gap-2 rounded-full bg-canada-red px-6 py-3 font-bold text-white transition-all hover:bg-red-700 hover:shadow-lg"
          >
            <Plus className="h-5 w-5" /> New Assessment
          </Link>
        </motion.div>

        {/* Summary metrics */}
        {assessments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 grid grid-cols-3 gap-4"
          >
            {[
              { label: "High Risk", count: highCount, color: "red", Icon: AlertOctagon },
              { label: "Medium Risk", count: mediumCount, color: "amber", Icon: AlertTriangle },
              { label: "Low Risk", count: lowCount, color: "green", Icon: CheckCircle },
            ].map(({ label, count, color, Icon }) => (
              <div
                key={label}
                className={clsx(
                  "rounded-xl border-2 p-5 text-center",
                  color === "red" && "border-red-200 bg-red-50",
                  color === "amber" && "border-amber-200 bg-amber-50",
                  color === "green" && "border-green-200 bg-green-50"
                )}
              >
                <Icon
                  className={clsx(
                    "mx-auto mb-2 h-6 w-6",
                    color === "red" && "text-red-600",
                    color === "amber" && "text-amber-600",
                    color === "green" && "text-green-600"
                  )}
                />
                <div
                  className={clsx(
                    "text-3xl font-black",
                    color === "red" && "text-red-700",
                    color === "amber" && "text-amber-700",
                    color === "green" && "text-green-700"
                  )}
                >
                  {count}
                </div>
                <div className="text-sm font-medium text-gray-600">{label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Assessment list or empty state */}
        {assessments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center shadow-sm"
          >
            <div className="mb-6 rounded-full bg-red-50 p-6">
              <FileText className="h-12 w-12 text-canada-red" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">No Assessments Yet</h2>
            <p className="mb-8 max-w-md text-gray-500">
              Start a guided assessment to identify AI risks and generate compliance documents aligned
              with NIST AI RMF and ISO 42001.
            </p>
            <Link
              href="/wizard"
              className="flex items-center gap-2 rounded-full bg-canada-red px-8 py-4 text-lg font-bold text-white transition-all hover:bg-red-700 hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Start New Assessment
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {assessments.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={clsx(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                      a.overallRiskLevel === "High" && "bg-red-100",
                      a.overallRiskLevel === "Medium" && "bg-amber-100",
                      a.overallRiskLevel === "Low" && "bg-green-100"
                    )}
                  >
                    <span
                      className={clsx(
                        "text-xl font-black",
                        a.overallRiskLevel === "High" && "text-red-700",
                        a.overallRiskLevel === "Medium" && "text-amber-700",
                        a.overallRiskLevel === "Low" && "text-green-700"
                      )}
                    >
                      {a.overallScore.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{a.toolName}</span>
                      <RiskBadge level={a.overallRiskLevel} />
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {a.department} &nbsp;·&nbsp; {a.useCase} &nbsp;·&nbsp;{" "}
                      {new Date(a.createdAt).toLocaleDateString("en-CA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/results?id=${a.id}`}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    View Report
                  </Link>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="rounded-lg p-2 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    aria-label="Delete assessment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
