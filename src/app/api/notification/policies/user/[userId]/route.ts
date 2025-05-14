import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = await params;

  try {
    const access_token = req.cookies.get("access_token")?.value;

    if (!access_token) {
      return NextResponse.json({ success: false, message: "No access token" }, { status: 401 });
    }

    const res = await fetch(`http://103.172.79.28:8000/api/notification/policies/user/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Không thể lấy danh sách chính sách" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi kết nối đến server" },
      { status: 500 }
    );
  }
}
