

import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { alertId: string } }
) {
  const { alertId } = await params;

  try {
    const response = await fetch(`http://103.172.79.28:8000/api/alert/delete/${alertId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Lỗi máy chủ khi xoá alert' }, { status: 500 });
  }
}