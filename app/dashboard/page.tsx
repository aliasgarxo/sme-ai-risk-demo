"use client";

import { Navbar } from "@/components/Navbar";
import { Plus, FileText } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-zinc-50 pb-20">
            <Navbar />

            <div className="container mx-auto max-w-5xl px-4 pt-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="mb-2 text-4xl font-bold text-gray-900">
                        My Assessments
                    </h1>
                    <p className="mb-10 text-xl text-gray-600">
                        Manage your AI risk assessments and compliance docs.
                    </p>
                </motion.div>

                {/* Empty State Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center shadow-sm"
                >
                    <div className="mb-6 rounded-full bg-red-50 p-6">
                        <FileText className="h-12 w-12 text-canada-red" />
                    </div>
                    <h2 className="mb-3 text-2xl font-bold text-gray-900">Assess Your AI Use Case</h2>
                    <p className="mb-8 max-w-md text-gray-500">
                        Start a guided assessment to identify risks and generate compliance docs (NIST/ISO).
                    </p>
                    <Link
                        href="/wizard"
                        className="flex items-center gap-2 rounded-full bg-canada-red px-8 py-4 text-lg font-bold text-white transition-all hover:bg-red-700 hover:shadow-lg"
                    >
                        <Plus className="h-5 w-5" />
                        Start New Assessment
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
