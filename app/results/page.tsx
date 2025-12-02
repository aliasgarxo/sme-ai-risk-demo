"use client";

import { Navbar } from "@/components/Navbar";
import { FileText, AlertTriangle, CheckCircle, AlertOctagon, Download, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ResultsPage() {
    return (
        <div className="min-h-screen bg-zinc-50 pb-20">
            <Navbar />

            <div className="container mx-auto max-w-5xl px-4 pt-12">
                <Link href="/dashboard" className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-canada-red">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="mb-2 text-4xl font-bold text-gray-900">
                        Assessment Results
                    </h1>
                    <p className="mb-10 text-xl text-gray-600">
                        Here is the risk profile for your AI system.
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* High Risk Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="rounded-xl border-2 border-canada-red bg-red-50 p-6 shadow-lg"
                    >
                        <div className="mb-4 flex items-center gap-3 text-canada-red">
                            <AlertOctagon className="h-8 w-8" />
                            <h3 className="text-xl font-bold">High Risk</h3>
                        </div>
                        <p className="text-gray-700">
                            <strong>Data Sensitivity:</strong> Processing PII requires strict compliance with privacy laws (PIPEDA).
                        </p>
                    </motion.div>

                    {/* Medium Risk Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="rounded-xl border-2 border-amber-400 bg-amber-50 p-6 shadow-lg"
                    >
                        <div className="mb-4 flex items-center gap-3 text-amber-600">
                            <AlertTriangle className="h-8 w-8" />
                            <h3 className="text-xl font-bold">Medium Risk</h3>
                        </div>
                        <p className="text-gray-700">
                            <strong>Decision Impact:</strong> Automated decisions may require human oversight and explainability.
                        </p>
                    </motion.div>

                    {/* Low Risk Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="rounded-xl border-2 border-green-500 bg-green-50 p-6 shadow-lg"
                    >
                        <div className="mb-4 flex items-center gap-3 text-green-600">
                            <CheckCircle className="h-8 w-8" />
                            <h3 className="text-xl font-bold">Low Risk</h3>
                        </div>
                        <p className="text-gray-700">
                            <strong>Transparency:</strong> The system purpose is clear and well-documented.
                        </p>
                    </motion.div>
                </div>

                {/* Download Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-12"
                >
                    <h2 className="mb-6 text-2xl font-bold text-gray-900">Governance Artifacts</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Risk Register PDF */}
                        <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
                            <div className="mb-4 rounded-full bg-red-100 p-3 text-canada-red">
                                <FileText className="h-8 w-8" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-gray-900">Risk Register</h3>
                            <p className="mb-6 text-center text-sm text-gray-600">
                                Comprehensive log of identified risks and mitigation strategies.
                            </p>
                            <button className="mt-auto flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900">
                                <Download className="h-4 w-4" /> Download PDF
                            </button>
                        </div>

                        {/* Model Card PDF */}
                        <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
                            <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600">
                                <FileText className="h-8 w-8" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-gray-900">Model Card</h3>
                            <p className="mb-6 text-center text-sm text-gray-600">
                                Standardized report on model performance and limitations.
                            </p>
                            <button className="mt-auto flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900">
                                <Download className="h-4 w-4" /> Download PDF
                            </button>
                        </div>

                        {/* DPIA PDF */}
                        <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
                            <div className="mb-4 rounded-full bg-purple-100 p-3 text-purple-600">
                                <FileText className="h-8 w-8" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-gray-900">DPIA Summary</h3>
                            <p className="mb-6 text-center text-sm text-gray-600">
                                Data Protection Impact Assessment for privacy compliance.
                            </p>
                            <button className="mt-auto flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900">
                                <Download className="h-4 w-4" /> Download PDF
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
