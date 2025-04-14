import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPages = ["/login", "/register", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;

  if (!publicPages.includes(pathname) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || 
       pathname === "/register" || 
       pathname === "/forgot-password" || 
       pathname.startsWith("/reset-password")) && 
      token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};