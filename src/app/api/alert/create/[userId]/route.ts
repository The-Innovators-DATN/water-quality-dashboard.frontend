// app/api/alert/create/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = await params.userId
    const body = await req.json()

    const accessToken = req.cookies.get('access_token')?.value;
    
    if (!accessToken) {
        return NextResponse.json({ error: 'No access token found' }, { status: 401 });
    }

    const response = await fetch(`http://103.172.79.28:8000/api/alert/create/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    })

    console.log('Response from API:', response);

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
