import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("erp_token")?.value;
  const { pathname } = request.nextUrl;

  // Halaman publik (tidak perlu login)
  const publicPaths = ["/login", "/api/auth/login"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  // API routes selain auth — bypass middleware
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/login")) {
    return NextResponse.next();
  }

  // Belum login → redirect ke /login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Sudah login tapi buka /login → redirect ke /dashboard
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
