export const runtime = 'edge';

import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const layer = searchParams.get("layer");

    if (!layer) {
        return NextResponse.json({ error: "Layer parameter is required" }, { status: 400 });
    }

    // Serve the file directly from the public folder
    return NextResponse.redirect(`/geojson/${layer}.json`);
}
