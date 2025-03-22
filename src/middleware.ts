// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Danh sách các trang không cần xác thực
const publicPages = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Nếu người dùng truy cập vào root "/", redirect đến "/dashboard/water"
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard/water", request.url));
  }

  // Lấy token từ cookie
  const token = request.cookies.get('token')?.value;

  // Kiểm tra nếu người dùng đang truy cập trang yêu cầu xác thực và không có token
  if (!publicPages.includes(pathname) && 
      !pathname.startsWith('/api') && 
      pathname.startsWith('/dashboard') && 
      !token) {
    // Chuyển hướng đến trang đăng nhập
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Ngăn người dùng đã đăng nhập truy cập các trang login/register/forgot-password
  if ((pathname === '/login' || 
       pathname === '/register' || 
       pathname === '/forgot-password' || 
       pathname.startsWith('/reset-password')) && 
      token) {
    return NextResponse.redirect(new URL('/dashboard/water', request.url));
  }

  return NextResponse.next();
}

// Áp dụng middleware cho các routes cần thiết
export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/forgot-password',
    '/reset-password'
  ],
};