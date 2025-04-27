import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const res = await fetch("http://103.172.79.28:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ message: error.message || "Login failed" }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json({
      message: data.message,
      expires_at: data.data.expires_at,
      access_token: data.data.access_token,
      refreshToken: data.data.refresh_token,
      status: data.status,
    });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong", error }, { status: 500 });
  }
}
