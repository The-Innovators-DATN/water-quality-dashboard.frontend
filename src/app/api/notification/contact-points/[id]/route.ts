import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = (await params).id;

  try {
    const res = await fetch(`http://103.172.79.28:8000/api/notification/contact-points/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = (await params).id;

  try {
    const body = await req.json();

    const res = await fetch(`http://103.172.79.28:8000/api/notification/contact-points/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return NextResponse.json(
        { success: false, message: json.message || "Cập nhật thất bại" },
        { status: res.status || 500 }
      );
    }

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi xử lý dữ liệu" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = (await params).id;

  try {
    const res = await fetch(`http://103.172.79.28:8000/api/notification/contact-points/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    } else {
      const error = await res.json();
      return NextResponse.json({ success: false, message: error.message || "Xoá thất bại" }, { status: res.status });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi kết nối đến server" }, { status: 500 });
  }
}