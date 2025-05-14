import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { uid: string } }
) {
  const { uid } = await params;

  try {
    const accessToken = req.cookies.get('access_token')?.value;
        
    if (!accessToken) {
        return NextResponse.json({ error: 'No access token found' }, { status: 401 });
    }

    const response = await fetch(`http://103.172.79.28:8000/api/alert/get/alert/${uid}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi máy chủ' }, { status: 500 });
  }
}