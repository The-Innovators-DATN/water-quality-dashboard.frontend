import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`http://103.172.79.28:8000/api/notification/notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    console.log(data);

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || "Lỗi khi lấy danh sách thông báo" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi kết nối đến máy chủ" },
      { status: 500 }
    );
  }
}