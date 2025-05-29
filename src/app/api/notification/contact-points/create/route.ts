import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, userId, type, email, botToken, chatId } = body;

    if (!name || !userId || !type) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    let configuration: Record<string, string> = {};

    if (type === "email") {
      if (!email) return NextResponse.json({ success: false, message: "Thiếu email" }, { status: 400 });
      configuration.email = email;
    } else if (type === "telegram") {
      if (!botToken || !chatId)
        return NextResponse.json({ success: false, message: "Thiếu botToken hoặc chatId" }, { status: 400 });
      configuration = { bot_token: botToken, chat_id: chatId };
    } else {
      return NextResponse.json({ success: false, message: "Loại không hợp lệ" }, { status: 400 });
    }

    const res = await fetch("http://103.172.79.28:8000/api/notification/contact-points/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        user_id: userId,
        type,
        configuration,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, message: data.message || "Tạo thất bại" }, { status: res.status });
    }

    return NextResponse.json({ success: true, message: "Tạo thành công", data: data.data });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
