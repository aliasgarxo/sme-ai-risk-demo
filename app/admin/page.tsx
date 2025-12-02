"use client";

import { useState } from "react";
import { AdminCopilot } from "@/components/admin/AdminCopilot";
import { EvaluationMatrix } from "@/components/admin/EvaluationMatrix";
import { KnowledgeBase } from "@/components/admin/KnowledgeBase";
import { Shield, LayoutDashboard, FileText, LogOut } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<"matrix" | "knowledge">("matrix");
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-lato">
            {/* Admin Header */}
            <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900 text-white">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-canada-red">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">Admin Console</span>
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
                            v2.0
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                            Exit to Dashboard
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                        >
                            <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Top Section: Admin Copilot */}
                <section className="mb-12">
                    <AdminCopilot />
                </section>

                {/* Bottom Section: Configuration Tabs */}
                <section>
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
                    </div>

                    <div className="mb-8 border-b border-gray-200">
                        <div className="flex gap-8">
                            <button
                                onClick={() => setActiveTab("matrix")}
                                className={clsx(
                                    "flex items-center gap-2 border-b-2 pb-4 text-sm font-medium transition-colors",
                                    activeTab === "matrix"
                                        ? "border-canada-red text-canada-red"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                )}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Risk Matrix
                            </button>
                            <button
                                onClick={() => setActiveTab("knowledge")}
                                className={clsx(
                                    "flex items-center gap-2 border-b-2 pb-4 text-sm font-medium transition-colors",
                                    activeTab === "knowledge"
                                        ? "border-canada-red text-canada-red"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                )}
                            >
                                <FileText className="h-4 w-4" />
                                Knowledge Base
                            </button>
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        {activeTab === "matrix" ? <EvaluationMatrix /> : <KnowledgeBase />}
                    </div>
                </section>
            </main>
        </div>
    );
}
