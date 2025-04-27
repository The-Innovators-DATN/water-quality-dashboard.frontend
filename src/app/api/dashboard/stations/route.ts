import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }

    const res = await fetch('http://103.172.79.28:8000/api/dashboard/stations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch stations: ${res.statusText}`);
    }

    const result = await res.json();

    return NextResponse.json({
      status: result.status,
      message: result.message,
      stations: result.data?.stations || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch station data', details: error.message },
      { status: 500 }
    );
  }
}
