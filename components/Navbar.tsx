"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { logout } from "@/app/login/actions";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/70 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <Leaf className="h-8 w-8 text-canada-red" />
                    <span className="text-xl font-bold tracking-tight text-gray-900">
                        SME AI Risk Register
                    </span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link
                        href="/wizard"
                        className="hidden text-sm font-medium text-gray-600 hover:text-canada-red sm:block"
                    >
                        New Assessment
                    </Link>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="text-sm font-medium text-canada-red hover:text-red-700"
                        >
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </nav>
    );
}
