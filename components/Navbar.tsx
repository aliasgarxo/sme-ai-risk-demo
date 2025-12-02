"use client";

import Link from "next/link";
import { Leaf, User, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function Navbar() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        setUser(null);
    };

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
                    {/* Role Switcher (Mock) */}
                    <button
                        onClick={() => setIsAdmin(!isAdmin)}
                        className={clsx(
                            "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                            isAdmin
                                ? "bg-canada-red/10 text-canada-red ring-1 ring-canada-red"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {isAdmin ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {isAdmin ? "Admin Mode" : "Standard User"}
                    </button>

                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="text-sm font-medium text-gray-600 hover:text-canada-red"
                        >
                            Admin Panel
                        </Link>
                    )}

                    {user ? (
                        <button
                            onClick={handleSignOut}
                            className="text-sm font-medium text-canada-red hover:text-red-700"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-full bg-canada-red px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-canada-red focus:ring-offset-2"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
