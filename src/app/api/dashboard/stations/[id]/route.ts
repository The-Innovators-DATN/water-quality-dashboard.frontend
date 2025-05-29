import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    const res = await fetch(`http://103.172.79.28:8000/api/dashboard/stations/${id}`);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Không tìm thấy trạm với ID ${id}` },
        { status: res.status }
      );
    }

    const result = await res.json();
    return NextResponse.json(result.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Lỗi khi gọi API máy chủ', message: error.message },
      { status: 500 }
    );
  }
}
