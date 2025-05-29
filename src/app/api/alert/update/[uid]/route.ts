import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: { uid: string } }) {
  const { uid } = await params;
  const body = await req.json();

  try {
    const response = await fetch(`http://103.172.79.28:8000/api/alert/update/${uid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result?.message || 'Cập nhật thất bại' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}