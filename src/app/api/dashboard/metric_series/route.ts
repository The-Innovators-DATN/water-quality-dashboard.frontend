import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch('http://103.172.79.28:8000/api/dashboard/metric_series', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json({ status: 'error', message: 'API external failed' }, { status: response.status });
    }

    const raw = await response.json();
    const results = raw?.data?.results || [];

    return NextResponse.json({ status: 'success', results });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}