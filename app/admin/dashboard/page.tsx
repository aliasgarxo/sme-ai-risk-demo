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

    const handleSignOut = async () => {
        // Clear demo cookie if present (client-side hack or just rely on supabase signout)
        document.cookie = "demo_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        await supabase.auth.signOut();
        router.push("/login");
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
                {/* Header */}
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
                        <p className="text-sm text-gray-500">Real-time governance insights across the organization.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search assessments..."
                                className="h-10 w-64 rounded-full border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-canada-red focus:ring-2 focus:ring-canada-red/10"
                            />
                        </div>
                        <button className="relative rounded-full bg-white p-2 text-gray-500 shadow-sm hover:text-gray-700">
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        </button>
                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                    </div>
                </header>

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
