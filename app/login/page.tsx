"use client";

import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { demoLogin } from "./actions";
import { User, Shield } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-zinc-50">
            <Navbar />

            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-2xl rounded-2xl bg-white p-12 shadow-xl"
                >
                    <h1 className="mb-2 text-3xl font-bold text-gray-900 text-center">
                        Welcome to SME AI Risk Register
                    </h1>
                    <p className="mb-12 text-center text-gray-600">
                        Select a role to explore the platform.
                    </p>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* SME User Button */}
                        <form action={async () => {
                            "use server";
                            await demoLogin("user");
                        }}>
                            <button
                                type="submit"
                                className="group flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-canada-red bg-white p-8 transition-all hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-canada-red/20"
                            >
                                <div className="rounded-full bg-red-100 p-4 transition-colors group-hover:bg-red-200">
                                    <User className="h-8 w-8 text-canada-red" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-900">Login as SME User</h3>
                                    <p className="text-sm text-gray-500">Pre-filled: user@demo.com</p>
                                </div>
                            </button>
                        </form>

                        {/* Admin Button */}
                        <form action={async () => {
                            "use server";
                            await demoLogin("admin");
                        }}>
                            <button
                                type="submit"
                                className="group flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-slate-700 bg-slate-800 p-8 transition-all hover:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-500/20"
                            >
                                <div className="rounded-full bg-slate-700 p-4 transition-colors group-hover:bg-slate-600">
                                    <Shield className="h-8 w-8 text-white" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-white">Login as Admin</h3>
                                    <p className="text-sm text-slate-400">Global Oversight View</p>
                                </div>
                            </button>
                        </form>
                    </div>

                    <p className="mt-12 text-center text-sm text-gray-500">
                        This is a friction-free demo environment. No password required.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
