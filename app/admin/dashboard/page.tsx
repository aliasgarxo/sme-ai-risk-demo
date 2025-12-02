"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    Shield,
    Users,
    Settings,
    LogOut,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Search,
    Bell
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
    const router = useRouter();
    const supabase = createClient();
    const [inputValue, setInputValue] = useState("");
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);

    const handleSignOut = async () => {
        document.cookie = "demo_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        await supabase.auth.signOut();
        router.push("/login");
    };

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        setIsTyping(true);
        setAiResponse(null); // Clear previous response
        setInputValue(text); // Ensure input reflects what was sent (e.g. if clicked chip)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });

            if (!response.ok) throw new Error("Failed to fetch");

            const data = await response.json();
            let aiText = "Sorry, I couldn't process that.";

            try {
                aiText = data.outputs[0].outputs[0].results.message.text;
            } catch (e) {
                if (data.result) aiText = data.result;
            }

            setAiResponse(aiText);
        } catch (error) {
            console.error("AI Error:", error);
            setAiResponse("Sorry, I'm having trouble connecting to the AI agent right now.");
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-zinc-50 font-lato">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
                <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-canada-red">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-gray-900">Admin Console</span>
                </div>

                <nav className="space-y-1 p-4">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-canada-red"
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                        <Settings className="h-5 w-5" />
                        Configuration
                    </Link>
                    <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-not-allowed opacity-60">
                        <Users className="h-5 w-5" />
                        User Management
                    </div>
                </nav>

                <div className="absolute bottom-4 left-0 w-full px-4">
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                {/* AI Copilot Section */}
                <section className="mb-12 flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 w-full max-w-3xl"
                    >
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">
                            How can I help you <span className="text-canada-red">manage risk</span> today?
                        </h1>
                        <p className="text-gray-500">Your AI-powered governance assistant is ready.</p>
                    </motion.div>

                    <div className="relative w-full max-w-2xl">
                        <div className="relative flex items-center overflow-hidden rounded-full bg-white shadow-xl ring-1 ring-gray-100 transition-all focus-within:ring-2 focus-within:ring-canada-red/20">
                            <div className="pl-6 text-canada-red">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
                                placeholder="Ask about compliance, high risk cases, or regulations..."
                                className="w-full border-none bg-transparent py-4 pl-4 pr-14 text-lg text-gray-900 placeholder:text-gray-400 focus:ring-0"
                            />
                            <button
                                onClick={() => handleSend(inputValue)}
                                disabled={!inputValue.trim() || isTyping}
                                className="absolute right-2 rounded-full bg-canada-red p-2 text-white transition-transform hover:scale-105 disabled:opacity-50"
                            >
                                <TrendingUp className="h-5 w-5" /> {/* Using TrendingUp as a generic 'action' icon or could use Send */}
                            </button>
                        </div>

                        {/* Suggested Chips */}
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {[
                                "Show high risk cases",
                                "Explain NIST compliance",
                                "Draft a summary"
                            ].map((chip) => (
                                <button
                                    key={chip}
                                    onClick={() => handleSend(chip)}
                                    className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-canada-red hover:text-canada-red"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Answer Card */}
                    {(aiResponse || isTyping) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-8 text-left shadow-lg"
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-canada-red to-red-600">
                                    <Shield className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-bold text-gray-900">AI Risk Sentinel</span>
                            </div>

                            {isTyping ? (
                                <div className="space-y-3">
                                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                                </div>
                            ) : (
                                <div className="prose prose-red max-w-none text-gray-700">
                                    {/* Simple rendering for now, could use ReactMarkdown if imported */}
                                    <p className="whitespace-pre-wrap">{aiResponse}</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </section>

                {/* Header for Stats */}
                <div className="mb-6 flex items-center justify-between border-t border-gray-100 pt-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">System Overview</h2>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Last updated: Just now</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="mb-8 grid gap-6 md:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-medium text-green-600">+12% this week</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">124</h3>
                        <p className="text-sm text-gray-500">Total Assessments</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div className="rounded-lg bg-red-50 p-3 text-red-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-medium text-red-600">+2 new</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">14</h3>
                        <p className="text-sm text-gray-500">High Risk Cases</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div className="rounded-lg bg-green-50 p-3 text-green-600">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-medium text-green-600">Stable</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">87%</h3>
                        <p className="text-sm text-gray-500">Compliance Score</p>
                    </motion.div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <h3 className="font-semibold text-gray-900">Recent Assessments</h3>
                    </div>
                    <div className="p-6">
                        <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-100 bg-gray-50 text-gray-400">
                            Chart / Data Table Placeholder
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
