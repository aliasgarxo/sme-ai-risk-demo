"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: "Invalid credentials." };
    }

    if (email === "admin@demo.com") {
        redirect("/admin");
    }

    redirect("/dashboard");
}

export async function demoLogin(role: "user" | "admin") {
    const cookieStore = await cookies();
    cookieStore.set("demo_role", role);

    if (role === "admin") {
        redirect("/admin/dashboard");
    } else {
        redirect("/dashboard");
    }
}
