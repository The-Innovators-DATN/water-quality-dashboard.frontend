import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://103.172.79.28:8000/api/dashboard/parameters", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { message: "Không thể lấy dữ liệu thông số.", error: errorText },
        { status: res.status }
      );
    }

    const json = await res.json();
    return NextResponse.json(json.data);
  } catch (error) {
    console.error("GET /api/dashboard/parameters error:", error);
    return NextResponse.json(
      { message: "Lỗi máy chủ khi lấy dữ liệu thông số." },
      { status: 500 }
    );
  }
}
