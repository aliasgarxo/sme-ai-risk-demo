"use client";

import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const handleSignIn = () => {
        // Set cookie to bypass middleware
        document.cookie = "demo_role=user; path=/";
        router.push("/dashboard");
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

                    <form className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email Address
                            </label>
                            <input
                                type="text"
                                name="email"
                                id="email"
                                defaultValue="demo@sme.com"
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
                                defaultValue="password"
                                className="mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 outline-none transition-colors focus:border-canada-red focus:ring-4 focus:ring-canada-red/10"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleSignIn}
                            className="w-full rounded-full bg-canada-red py-3 text-lg font-bold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-canada-red focus:ring-offset-2"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link href="/signup" className="font-medium text-canada-red hover:underline">
                                Sign up
                            </Link>
                        </p>
                        <div className="mt-4">
                            <button
                                onClick={() => {
                                    document.cookie = "demo_role=admin; path=/";
                                    router.push("/admin/dashboard");
                                }}
                                className="text-xs text-gray-400 hover:text-gray-600 underline"
                            >
                                Login as Admin
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
