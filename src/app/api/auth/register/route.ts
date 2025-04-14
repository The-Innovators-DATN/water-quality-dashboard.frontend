export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { fullname, email, password } = await req.json();

    const res = await fetch("http://103.172.79.28:8000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, fullname, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Đăng ký thất bại", status: "error" },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { message: "Đăng ký thành công", data, status: "success" },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { message: "Lỗi máy chủ hoặc mạng", status: "error" },
      { status: 500 }
    );
  }
}
