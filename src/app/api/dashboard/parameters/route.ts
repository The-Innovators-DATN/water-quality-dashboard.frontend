import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }

    const res = await fetch("http://160.191.49.128:8000/api/dashboard/parameters", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    const json = await res.json();
    const parameters = json?.data?.parameters || [];

    console.log("Proxy fetched", parameters.length, "parameters");

    return NextResponse.json({ parameters });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
