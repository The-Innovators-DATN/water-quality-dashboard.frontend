'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

type ContactPoint = {
  id: string;
  name: string;
  type: "email" | "telegram";
  status: "active" | "inactive";
  configuration: {
    email?: string;
    bot_token?: string;
    chat_id?: string;
    [key: string]: any;
  };
};

export default function ContactDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<ContactPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/notification/contact-points/${id}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          toast.error("Không thể lấy chi tiết điểm liên lạc.");
        }
      } catch {
        toast.error("Lỗi khi gọi API.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/notification/contact-points/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: data.id,
          name: data.name,
          type: data.type,
          status: data.status,
          configuration: data.configuration,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("Cập nhật thành công!");
      } else {
        toast.error(json.message || "Cập nhật thất bại.");
      }
    } catch {
      toast.error("Lỗi khi gọi API.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">Đang tải...</div>
    );
  }

  if (!data) {
    return <div className="p-4 text-red-500">Không tìm thấy dữ liệu.</div>;
  }

  return (
    <div className="w-full h-full p-4 space-y-4">
      <h1 className="text-xl font-semibold text-gray-700">Cập nhật điểm liên lạc</h1>

      <label className="block">
        <span className="text-sm font-medium">Tên</span>
        <input
          className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Trạng thái</span>
        <select
          className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
          value={data.status}
          onChange={(e) => setData({ ...data, status: e.target.value as "active" | "inactive" })}
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium">Loại</span>
        <select
          className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
          value={data.type}
          onChange={(e) => {
            const newType = e.target.value as "email" | "telegram";
            setData({ ...data, type: newType });
          }}
        >
          <option value="email">Email</option>
          <option value="telegram">Telegram</option>
        </select>
      </label>

      {data.type === "email" && (
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
            value={data.configuration.email || ""}
            onChange={(e) =>
              setData({
                ...data,
                configuration: {
                  ...data.configuration,
                  email: e.target.value,
                },
              })
            }
          />
        </label>
      )}

      {data.type === "telegram" && (
        <>
          <label className="block">
            <span className="text-sm font-medium">Bot Token</span>
            <input
              className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
              value={data.configuration.bot_token || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  configuration: {
                    ...data.configuration,
                    bot_token: e.target.value,
                  },
                })
              }
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Chat ID</span>
            <input
              className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
              value={data.configuration.chat_id || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  configuration: {
                    ...data.configuration,
                    chat_id: e.target.value,
                  },
                })
              }
            />
          </label>
        </>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}
