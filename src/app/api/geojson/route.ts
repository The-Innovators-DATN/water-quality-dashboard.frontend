export const runtime = 'edge';

import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const layer = searchParams.get("layer");

    if (!layer) {
        return NextResponse.json({ error: "Layer parameter is required" }, { status: 400 });
    }

    try {
        const host = req.headers.get("host");
        const protocol = req.headers.get("x-forwarded-proto") || "https";
        const absoluteUrl = `${protocol}://${host}/geojson/${layer}.json`;

        const geojsonResponse = await fetch(absoluteUrl);
        const geojsonData = await geojsonResponse.json();
        return NextResponse.json(geojsonData, { status: 200 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "GeoJSON file not found" }, { status: 404 });
    }
}
