import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = (await params);

  try {
    const res = await fetch(`http://103.172.79.28:8000/api/report/schedule-reports/${id}`);

    const result = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: result.message || "Không tìm thấy báo cáo" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết báo cáo:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    const body = await req.json();

    const res = await fetch(`http://103.172.79.28:8000/api/report/schedule-reports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await res.json();

    console.log("result", result);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: result.message || "Cập nhật thất bại" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Lỗi khi cập nhật báo cáo:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = (await params);

  try {
    const res = await fetch(`http://103.172.79.28:8000/api/report/schedule-reports/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    console.log("result", res);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: result.message || "Xóa báo cáo thất bại" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Lỗi khi xóa schedule report:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ" },
      { status: 500 }
    );
  }
}
