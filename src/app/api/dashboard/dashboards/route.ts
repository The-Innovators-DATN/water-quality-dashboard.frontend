import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch("http://103.172.79.28:8000/api/dashboard/dashboards", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ message: "Lỗi từ API", error: errorData }, { status: 500 });
    }

    const result = await response.json();
    return NextResponse.json({ message: "Tạo dashboard thành công", data: result });
  } catch (err) {
    console.error("Lỗi khi gọi API tạo dashboard:", err);
    return NextResponse.json({ message: "Lỗi server", error: err }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("created_by");

  if (!userId) {
    return NextResponse.json({ message: "Thiếu tham số created_by" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `http://103.172.79.28:8000/api/dashboard/dashboards?created_by=${userId}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ message: "Lỗi từ API", error: errorData }, { status: 500 });
    }

    const result = await response.json();
    return NextResponse.json({ message: "Lấy danh sách dashboard thành công", data: result });
  } catch (err) {
    console.error("Lỗi khi gọi API danh sách dashboard:", err);
    return NextResponse.json({ message: "Lỗi server", error: err }, { status: 500 });
  }
}