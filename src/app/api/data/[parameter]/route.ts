import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, context: { params: { parameter: string } }) {
  const { parameter } = await context.params;
  const now = new Date().getTime();

  const data = Array.from({ length: 20 }).map((_, idx) => ({
    timestamp: new Date(now - (20 - idx) * 60 * 1000).toISOString(),
    value: Math.random() * 100 + (parameter === "pH" ? 5 : 0),
  }));

  return Response.json({ parameter, data });
}