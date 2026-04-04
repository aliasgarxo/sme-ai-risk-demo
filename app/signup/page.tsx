import { redirect } from "next/navigation";

// Sign-up is not available in this demo — all access is via the login page.
export default function SignupPage() {
  redirect("/login");
}
