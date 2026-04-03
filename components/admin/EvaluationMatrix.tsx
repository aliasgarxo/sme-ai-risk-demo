"use client";

import { useState } from "react";
import { Save, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Info } from "lucide-react";
import clsx from "clsx";
import { SCORING_CRITERIA, type CriterionDefinition } from "@/lib/scoring";

type RiskThreshold = "Low" | "Medium" | "High";

interface CriterionConfig {
  id: string;
  name: string;
  weight: number;
  threshold: RiskThreshold;
  active: boolean;
}

const INITIAL_CONFIG: CriterionConfig[] = SCORING_CRITERIA.map((c) => ({
  id: c.id,
  name: c.name,
  weight: c.weight,
  threshold: c.weight >= 20 ? "High" : c.weight >= 15 ? "Medium" : "Low",
  active: true,
}));

function ScoreBandTable({ criterion }: { criterion: CriterionDefinition }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left text-xs text-gray-600">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 font-semibold text-gray-800 w-24">Score Range</th>
            <th className="px-4 py-2 font-semibold text-gray-800 w-40">Level</th>
            <th className="px-4 py-2 font-semibold text-gray-800">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {criterion.scoringRubric.map((band) => {
            const isHigh = band.min >= 7;
            const isMed = !isHigh && band.min >= 4;
            return (
              <tr key={`${band.min}-${band.max}`} className="hover:bg-gray-50/60">
                <td className="px-4 py-2 font-mono font-bold">
                  <span
                    className={clsx(
                      "rounded px-1.5 py-0.5 text-xs",
                      isHigh ? "bg-red-100 text-red-700" : isMed ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                    )}
                  >
                    {band.min === band.max ? band.min : `${band.min}–${band.max}`}
                  </span>
                </td>
                <td className="px-4 py-2 font-medium text-gray-800">{band.label}</td>
                <td className="px-4 py-2 text-gray-600">{band.description}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex gap-4 border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-green-400" /> 1–3.5 = Low Risk</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-amber-400" /> 4–6.5 = Medium Risk</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded bg-red-500" /> 7–10 = High Risk</span>
      </div>
    </div>
  );
}

export function EvaluationMatrix() {
  const [config, setConfig] = useState<CriterionConfig[]>(INITIAL_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleWeightChange = (id: string, value: string) => {
    const num = Math.max(0, Math.min(100, parseInt(value) || 0));
    setConfig((prev) => prev.map((c) => (c.id === id ? { ...c, weight: num } : c)));
  };

  const handleThresholdChange = (id: string, value: RiskThreshold) => {
    setConfig((prev) => prev.map((c) => (c.id === id ? { ...c, threshold: value } : c)));
  };

  const handleToggleActive = (id: string) => {
    setConfig((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const totalWeight = config.filter((c) => c.active).reduce((sum, c) => sum + c.weight, 0);
  const weightOk = totalWeight === 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Risk Evaluation Matrix</h3>
            <p className="text-sm text-gray-500">
              Configure weights and thresholds. Expand each criterion to see the full 1–10 scoring rubric.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || !weightOk}
            className="flex items-center gap-2 rounded-lg bg-canada-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="animate-pulse">Saving...</span>
            ) : showSuccess ? (
              <><CheckCircle className="h-4 w-4" /> Saved</>
            ) : (
              <><Save className="h-4 w-4" /> Save Config</>
            )}
          </button>
        </div>

        {/* Weight summary bar */}
        <div className="border-b border-gray-100 px-6 py-3">
          <div className="mb-1 flex justify-between text-xs font-medium">
            <span className="text-gray-500">Active weight total</span>
            <span className={clsx("font-bold", weightOk ? "text-green-600" : "text-red-600")}>
              {totalWeight}% {weightOk ? "✓" : `— needs to be 100%`}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={clsx("h-full rounded-full transition-all", weightOk ? "bg-green-500" : "bg-red-500")}
              style={{ width: `${Math.min(totalWeight, 100)}%` }}
            />
          </div>
        </div>

        {/* Criterion rows */}
        <div className="divide-y divide-gray-100">
          {config.map((c) => {
            const def = SCORING_CRITERIA.find((s) => s.id === c.id)!;
            const isExpanded = expandedId === c.id;

            return (
              <div key={c.id} className={clsx("transition-colors", !c.active && "opacity-50")}>
                <div className="flex items-center gap-4 px-6 py-4">
                  {/* Toggle active */}
                  <input
                    type="checkbox"
                    checked={c.active}
                    onChange={() => handleToggleActive(c.id)}
                    className="h-4 w-4 cursor-pointer accent-canada-red"
                    title="Enable/disable this criterion"
                  />

                  {/* Name */}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-500">{def.description}</div>
                  </div>

                  {/* Weight */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={c.weight}
                      onChange={(e) => handleWeightChange(c.id, e.target.value)}
                      disabled={!c.active}
                      className="w-16 rounded-md border border-gray-300 px-2 py-1.5 text-center text-sm focus:border-canada-red focus:outline-none focus:ring-1 focus:ring-canada-red disabled:bg-gray-50"
                    />
                    <span className="text-xs text-gray-400">%</span>
                  </div>

                  {/* Threshold */}
                  <select
                    value={c.threshold}
                    onChange={(e) => handleThresholdChange(c.id, e.target.value as RiskThreshold)}
                    disabled={!c.active}
                    className={clsx(
                      "rounded-full px-3 py-1 text-xs font-semibold focus:outline-none disabled:opacity-60",
                      c.threshold === "High" && "bg-red-100 text-red-700",
                      c.threshold === "Medium" && "bg-amber-100 text-amber-700",
                      c.threshold === "Low" && "bg-green-100 text-green-700"
                    )}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>

                  {/* Expand rubric */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    title="View scoring rubric"
                  >
                    <Info className="h-3.5 w-3.5" />
                    Rubric
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Expanded rubric */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-6 pb-5 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Scoring Rubric — {c.name}
                    </p>
                    <ScoreBandTable criterion={def} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!weightOk && (
          <div className="flex items-center gap-2 border-t border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Active criterion weights must sum to exactly 100%. Current total: {totalWeight}%.
          </div>
        )}
      </div>

      {/* Risk band reference card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 font-semibold text-gray-900">Score-to-Risk-Level Mapping</h4>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { range: "1.0 – 3.5", level: "Low Risk", color: "green", desc: "Adequate controls in place. Monitor and maintain current practices.", examples: "1.0 – Exemplary | 2.0 – Strong | 3.0 – Adequate | 3.5 – Minor gaps" },
            { range: "4.0 – 6.5", level: "Medium Risk", color: "amber", desc: "Notable gaps identified. Corrective action required within 90 days.", examples: "4.0 – Partial | 5.0 – Significant gaps | 6.0 – Weak | 6.5 – Systemic" },
            { range: "7.0 – 10.0", level: "High Risk", color: "red", desc: "Critical deficiencies. Immediate action required before continued use.", examples: "7.0 – Minimal | 8.0 – Absent | 9.0 – None | 10.0 – Critical failure" },
          ].map(({ range, level, color, desc, examples }) => (
            <div
              key={level}
              className={clsx(
                "rounded-xl border-2 p-4",
                color === "green" && "border-green-300 bg-green-50",
                color === "amber" && "border-amber-300 bg-amber-50",
                color === "red" && "border-red-300 bg-red-50"
              )}
            >
              <div
                className={clsx(
                  "mb-1 text-2xl font-black",
                  color === "green" && "text-green-700",
                  color === "amber" && "text-amber-700",
                  color === "red" && "text-red-700"
                )}
              >
                {range}
              </div>
              <div
                className={clsx(
                  "mb-2 text-sm font-bold",
                  color === "green" && "text-green-800",
                  color === "amber" && "text-amber-800",
                  color === "red" && "text-red-800"
                )}
              >
                {level}
              </div>
              <p className="mb-3 text-xs text-gray-600">{desc}</p>
              <p className="text-xs text-gray-400 italic">{examples}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Scores use 0.5 increments. The overall score is a weighted average of all active criterion scores.
          Scores 1–10 where 1 = lowest risk and 10 = highest risk.
        </p>
      </div>
    </div>
  );
}
