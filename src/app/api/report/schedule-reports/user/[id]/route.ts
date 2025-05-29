import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id } = (await params);

  try {
    const res = await fetch(`http://103.172.79.28:8000/api/report/schedule-reports/user/${id}`);
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, message: data.message || "Lỗi khi lấy danh sách report" }, { status: res.status });
    }

    return NextResponse.json({ success: true, data: data.data || [] });
  } catch (error) {
    console.error("Lỗi khi fetch reports:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
