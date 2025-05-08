import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { uid: string } }) {
  const uid = await params.uid;

  try {
    const accessToken = req.cookies.get('access_token')?.value;

    if (!accessToken) {
        return NextResponse.json({ error: 'No access token' }, { status: 401 })
    };

    const res = await fetch(`http://103.172.79.28:8000/api/notification/contact-points/${uid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json({ success: false, message: "Lỗi khi lấy dữ liệu điểm liên lạc." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi kết nối tới server." }, { status: 500 });
  }
}
