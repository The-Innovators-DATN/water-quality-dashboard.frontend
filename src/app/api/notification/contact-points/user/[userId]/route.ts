import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = await params;

  try {
    const accessToken = req.cookies.get('access_token')?.value;

    if (!accessToken) {
        return NextResponse.json({ error: 'No access token' }, { status: 401 })
    }

    const res = await fetch(`http://103.172.79.28:8000/api/notification/contact-points/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || "Lỗi khi lấy danh sách điểm liên lạc" },
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