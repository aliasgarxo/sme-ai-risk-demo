"use client";

import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useTransition } from "react";
import { login } from "./actions";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) setError(result.error);
    });
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
          <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mb-8 text-center text-gray-600">
            Sign in to access your AI risk assessments.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                defaultValue="demo@sme.com"
                className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none transition-colors focus:border-canada-red focus:ring-4 focus:ring-canada-red/10"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                defaultValue="demo123"
                className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none transition-colors focus:border-canada-red focus:ring-4 focus:ring-canada-red/10"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-canada-red py-3 text-lg font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 rounded-xl bg-gray-50 p-4 text-xs text-gray-500">
            <p className="mb-1 font-semibold text-gray-700">Demo Credentials</p>
            <p>User &nbsp;&nbsp;— demo@sme.com / demo123</p>
            <p>Admin — admin@sme.com / admin123</p>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-canada-red hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
