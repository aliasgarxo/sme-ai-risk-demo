"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 text-center">
            {/* Aurora Orb */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-aurora-green via-aurora-purple to-aurora-blue opacity-30 blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-4xl"
            >
                <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl">
                    AI Governance, <span className="text-canada-red">Eh?</span>
                </h1>
                <p className="mb-10 text-xl text-gray-600 sm:text-2xl">
                    Responsible AI for Canadian Business. Assess your risks, generate
                    reports, and stay compliant with confidence.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        href="/login"
                        className="group flex items-center gap-2 rounded-full bg-canada-red px-8 py-4 text-lg font-bold text-white transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/30"
                    >
                        Get Started
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
