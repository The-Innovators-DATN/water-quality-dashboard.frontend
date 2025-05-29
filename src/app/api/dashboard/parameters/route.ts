import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {  
    const res = await fetch("http://103.172.79.28:8000/api/dashboard/parameters");

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
