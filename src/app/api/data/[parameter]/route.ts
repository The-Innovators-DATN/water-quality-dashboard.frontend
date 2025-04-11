import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, context: { params: { parameter: string } }) {
  const { parameter } = await context.params;
  const range = req.nextUrl.searchParams.get("range") || "1h";

  // Convert range to milliseconds
  const rangeMap: Record<string, number> = {
    "1h": 60 * 60 * 1000,
    "6h": 6 * 60 * 60 * 1000,
    "12h": 12 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
  };

  const rangeMs = rangeMap[range] || 60 * 60 * 1000;
  const now = Date.now();

  const dataPoints = 50; // số lượng điểm mock
  const data = Array.from({ length: dataPoints }).map((_, i) => ({
    timestamp: new Date(now - rangeMs + (i * rangeMs) / dataPoints).toISOString(),
    value: +(Math.random() * 100).toFixed(2),
    anomaly: Math.random() < 0.1 ? true : false,
  }));

  const forecast = Array.from({ length: 10 }).map((_, i) => ({
    timestamp: new Date(now + (i + 1) * 5 * 60 * 1000).toISOString(), // 5 phút mỗi điểm
    value: +(Math.random() * 100).toFixed(2),
    anomaly: false,
  }));

  return Response.json({
    parameter,
    data,
    forecast,
  });
}
