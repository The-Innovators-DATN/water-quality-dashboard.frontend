"use client";

import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function PolicyDetailPage() {
  const userId = useAuthStore.getState().getUserId();
  
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contactPoints, setContactPoints] = useState<any[]>([]);
  
    useEffect(() => {
      const fetchPolicy = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/notification/policies/${id}`);
          const json = await res.json();
          if (json.success) {
            setData(json.data);
          } else {
            toast.error("Không thể lấy chi tiết chính sách.");
          }
        } catch {
          toast.error("Lỗi khi gọi API.");
        } finally {
          setIsLoading(false);
        }
      };
  
      const fetchContactPoints = async () => {
        try {
          const res = await fetch(`/api/notification/contact-points/user/${userId}`);
          const json = await res.json();
          if (json.success) {
            setContactPoints(json.data);
          }
        } catch {}
      };
  
      fetchPolicy();
      fetchContactPoints();
    }, [id]);
  
    const handleSave = async () => {
      if (!data) return;
      setIsSaving(true);
      try {
        const res = await fetch(`/api/notification/policies/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
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
  
    if (isLoading) return <div className="p-4 text-center text-sm text-gray-500">Đang tải...</div>;
    if (!data) return <div className="p-4 text-red-500">Không tìm thấy dữ liệu.</div>;
  
    return (
      <div className="w-full h-full p-4 space-y-4">
        <h1 className="text-xl font-semibold text-gray-700">Cập nhật chính sách</h1>
  
        <label className="block">
          <span className="text-sm font-medium">Điểm liên lạc</span>
          <select
            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
            value={data.contact_point_id}
            onChange={(e) => setData({ ...data, contact_point_id: e.target.value })}
          >
            {contactPoints.map((cp: any) => (
              <option key={cp.id} value={cp.id}>{cp.name}</option>
            ))}
          </select>
        </label>
  
        <label className="block">
          <span className="text-sm font-medium">Mức độ nghiêm trọng</span>
          <select
            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
            value={data.severity}
            onChange={(e) => setData({ ...data, severity: Number(e.target.value) })}
          >
            <option value={1}>1 - Thông tin</option>
            <option value={2}>2 - Cảnh cáo</option>
            <option value={3}>3 - Cao</option>
            <option value={4}>4 - Thiên tai</option>
          </select>
        </label>
  
        <label className="block">
          <span className="text-sm font-medium">Toán tử điều kiện</span>
          <select
            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
            value={data.operator}
            onChange={(e) => setData({ ...data, operator: e.target.value })}
          >
            <option value="=">Bằng (=)</option>
            <option value="!=">Khác (!=)</option>
            <option value=">">Lớn hơn (&gt;)</option>
            <option value=">=">Lớn hơn hoặc bằng (&ge;)</option>
            <option value="<">Nhỏ hơn (&lt;)</option>
            <option value="<=">Nhỏ hơn hoặc bằng (&le;)</option>
          </select>
        </label>
  
        <label className="block">
          <span className="text-sm font-medium">Hành động</span>
          <select
            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
            value={data.action}
            onChange={(e) => setData({ ...data, action: e.target.value })}
          >
            <option value="notify">Gửi thông báo</option>
          </select>
        </label>
  
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