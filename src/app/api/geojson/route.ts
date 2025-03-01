import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises"; // Dùng fs/promises để tránh blocking

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const layer = searchParams.get("layer");

    if (!layer) {
        return NextResponse.json({ error: "Layer parameter is required" }, { status: 400 });
    }

    try {
        // Đọc đường dẫn từ biến môi trường
        const geojsonPath = process.env.GEOJSON_PATH || "./public/geojson";
        const filePath = path.join(process.cwd(), geojsonPath, `${layer}.geojson`);

        const geojsonData = await fs.readFile(filePath, "utf-8");
        return NextResponse.json(JSON.parse(geojsonData), { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "GeoJSON file not found" }, { status: 404 });
    }
}
