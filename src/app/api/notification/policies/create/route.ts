import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { contact_point_id, severity, status, action, condition_type } = body;

    if (!contact_point_id || !severity || !status || !action || !condition_type) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin đầu vào" },
        { status: 400 }
      );
    }

    const response = await fetch("http://103.172.79.28:8000/api/notification/policies/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact_point_id,
        severity,
        status,
        action,
        condition_type,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ success: false, message: data.message || "Tạo thất bại" }, { status: response.status });
    }

    return NextResponse.json({ success: true, data: data.data, message: data.message }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}
