"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export default function NewContactPointPage() {
  const router = useRouter();
  const userId = useAuthStore.getState().getUserId();

  const [name, setName] = useState("");
  const [type, setType] = useState<"email" | "telegram">("email");
  const [email, setEmail] = useState("");
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
        name,
        type,
        userId,
        ...(type === "email"
          ? { email }
          : { botToken, chatId })
    };

    // if (type === "email") {
    //   payload.email = email;
    // } else if (type === "telegram") {
    //   payload.botToken = botToken;
    //   payload.chatId = chatId;
    // }

    try {
      const res = await fetch("/api/notification/contact-points/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Tạo điểm liên lạc thành công");
        router.push("/alert?tab=contacts");
      } else {
        toast.error(data.message || "Tạo thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối đến server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 p-4">
      <h1 className="text-xl font-semibold mb-4">Thêm điểm liên lạc mới</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="Nhập tên điểm liên lạc"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Loại</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "email" | "telegram")}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="email">Email</option>
            <option value="telegram">Telegram</option>
          </select>
        </div>

        {type === "email" && (
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
              placeholder="example@domain.com"
            />
          </div>
        )}

        {type === "telegram" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Bot Token</label>
              <input
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded"
                placeholder="123456:ABCDEF..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Chat ID</label>
              <input
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded"
                placeholder="123456789"
              />
            </div>
          </>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isSubmitting ? "Đang lưu..." : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
}
