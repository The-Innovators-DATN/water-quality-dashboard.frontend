import { NextRequest, NextResponse } from 'next/server'

const API_URL = 'http://103.172.79.28:8000/api/dashboard/station_parameters/by_target'

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 });
    }
    const body = await req.json()
    const { target_id } = await body

    if (!target_id) {
      return NextResponse.json({ status: 'error', message: 'Missing target_id' }, { status: 400 })
    }

    interface RequestPayload {
      target_type: string;
      target_id: number;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        target_type: 'STATION',
        target_id: parseInt(target_id),
      } as RequestPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ status: 'error', message: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
