import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("app_role")?.value;

  // Protect /dashboard — any logged-in user
  if (pathname.startsWith("/dashboard") && !role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect /wizard and /results — any logged-in user
  if ((pathname.startsWith("/wizard") || pathname.startsWith("/results")) && !role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect /admin — admin only
  if (pathname.startsWith("/admin")) {
    if (!role) return NextResponse.redirect(new URL("/login", request.url));
    if (role !== "admin") return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
