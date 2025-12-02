"use client";

import { useState } from "react";
import { Save, AlertTriangle, CheckCircle } from "lucide-react";
import clsx from "clsx";

type RiskCriteria = {
    id: string;
    name: string;
    weight: number;
    threshold: "Low" | "Medium" | "High";
};

const INITIAL_CRITERIA: RiskCriteria[] = [
    { id: "1", name: "Human Oversight", weight: 20, threshold: "High" },
    { id: "2", name: "Data Privacy", weight: 25, threshold: "High" },
    { id: "3", name: "Transparency", weight: 15, threshold: "Medium" },
    { id: "4", name: "Robustness", weight: 15, threshold: "Medium" },
    { id: "5", name: "Non-Discrimination", weight: 15, threshold: "High" },
    { id: "6", name: "Accountability", weight: 10, threshold: "Low" },
];

export function EvaluationMatrix() {
    const [criteria, setCriteria] = useState<RiskCriteria[]>(INITIAL_CRITERIA);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleWeightChange = (id: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setCriteria((prev) =>
            prev.map((c) => (c.id === id ? { ...c, weight: numValue } : c))
        );
    };

    const handleThresholdChange = (id: string, value: "Low" | "Medium" | "High") => {
        setCriteria((prev) =>
            prev.map((c) => (c.id === id ? { ...c, threshold: value } : c))
        );
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1000);
    };

    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Risk Evaluation Matrix</h3>
                    <p className="text-sm text-gray-500">Configure weights and thresholds for automated risk scoring.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-lg bg-canada-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                    {isSaving ? (
                        <span className="animate-pulse">Saving...</span>
                    ) : showSuccess ? (
                        <>
                            <CheckCircle className="h-4 w-4" /> Saved
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" /> Save Config
                        </>
                    )}
                </button>
            </div>

            <div className="p-6">
                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Criteria Name</th>
                                <th className="px-6 py-3 font-semibold">Weight (%)</th>
                                <th className="px-6 py-3 font-semibold">Risk Threshold</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {criteria.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={c.weight}
                                                onChange={(e) => handleWeightChange(c.id, e.target.value)}
                                                className="w-20 rounded-md border border-gray-300 px-3 py-1.5 text-center focus:border-canada-red focus:outline-none focus:ring-1 focus:ring-canada-red"
                                            />
                                            <span className="text-gray-400">%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={c.threshold}
                                            onChange={(e) => handleThresholdChange(c.id, e.target.value as any)}
                                            className={clsx(
                                                "rounded-full px-3 py-1 text-xs font-medium focus:outline-none",
                                                c.threshold === "High" && "bg-red-100 text-red-700",
                                                c.threshold === "Medium" && "bg-yellow-100 text-yellow-700",
                                                c.threshold === "Low" && "bg-green-100 text-green-700"
                                            )}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            Active
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 text-sm">
                    <span className="text-gray-500">Total Weight:</span>
                    <span={clsx("font-bold", totalWeight === 100 ? "text-green-600" : "text-red-600")}>
                    {totalWeight}%
                </span>
                {totalWeight !== 100 && (
                    <span className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3" /> Must equal 100%
                    </span>
                )}
            </div>
        </div>
    </div >
  );
}
