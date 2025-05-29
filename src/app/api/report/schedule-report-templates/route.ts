import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch("http://103.172.79.28:8000/api/report/schedule-report-templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, message: result.message || "Tạo template thất bại" }, { status: res.status });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Lỗi khi tạo template:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
