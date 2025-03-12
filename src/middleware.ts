import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Nếu người dùng truy cập vào root "/", redirect đến "/dashboard"
  // if (pathname === "/") {
  //   return NextResponse.redirect(new URL("/dashboard/water", request.url));
  // }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho root "/"
export const config = {
  matcher: "/",
};
