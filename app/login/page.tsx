"use client";

import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { login } from "./actions";
import { useState } from "react";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setError(null);

        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50">
            <Navbar />

            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
                >
                    <h1 className="mb-2 text-3xl font-bold text-gray-900 text-center">
                        Welcome Back
                    </h1>
                    <p className="mb-8 text-center text-gray-600">
                        Sign in to access your risk assessments.
                    </p>

                    <form className="space-y-6" action={handleSubmit}>
                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 text-center border border-red-100">
                                {error}
                            </div>
                        )}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                required
                                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 outline-none transition-colors focus:border-canada-red focus:ring-4 focus:ring-canada-red/10"
                                placeholder="you@company.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                required
                                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 outline-none transition-colors focus:border-canada-red focus:ring-4 focus:ring-canada-red/10"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-full bg-canada-red py-3 text-lg font-bold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-canada-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link href="/signup" className="font-medium text-canada-red hover:underline">
                            Sign up
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
