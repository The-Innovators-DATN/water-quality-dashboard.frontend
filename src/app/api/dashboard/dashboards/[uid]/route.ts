import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { uid: string } }) {
    const accessToken = req.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }
    const { uid } = await params;
    const userId = req.nextUrl.searchParams.get("created_by");

    try {
        const res = await fetch(`http://103.172.79.28:8000/api/dashboard/dashboards/${uid}?created_by=${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
            
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: true, message: data.message || "Lỗi khi lấy dashboard" }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: true, message: "Không thể kết nối máy chủ" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest, { params }: { params: { uid: string } }) {
    const accessToken = req.cookies.get("access_token")?.value;
  
    if (!accessToken) {
      return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }
  
    const { uid } = params;
    const userId = req.nextUrl.searchParams.get("created_by");
  
    try {
      const body = await req.json();
  
      const res = await fetch(`http://103.172.79.28:8000/api/dashboard/dashboards/${uid}?created_by=${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        return NextResponse.json(
          { error: true, message: data.message || "Lỗi khi cập nhật dashboard" },
          { status: res.status }
        );
      }
  
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json(
        { error: true, message: "Không thể kết nối máy chủ" },
        { status: 500 }
      );
    }
}