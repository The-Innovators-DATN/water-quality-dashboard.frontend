import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    const res = await fetch(`http://103.172.79.28:8000/api/report/schedule-report-templates/1b4c4b77-af0e-43db-98d0-9e253885014d`);
    const result = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: result.message || "Không tìm thấy báo cáo" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ" },
      { status: 500 }
    );
  }
}