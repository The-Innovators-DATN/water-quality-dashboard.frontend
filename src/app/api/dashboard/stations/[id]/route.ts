import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    const accessToken = req.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 });
    }

    const res = await fetch(`http://103.172.79.28:8000/api/dashboard/stations/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

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
