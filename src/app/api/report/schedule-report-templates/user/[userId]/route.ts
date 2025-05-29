import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  try {
    const res = await fetch(`http://103.172.79.28:8000/api/report/schedule-report-templates/user/${userId}`);

    const result = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: result.message || "Không lấy được template" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách template:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ" },
      { status: 500 }
    );
  }
}