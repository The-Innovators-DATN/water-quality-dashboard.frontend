"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export default function CreatePolicyPage() {
  const router = useRouter();
  const userId = useAuthStore.getState().getUserId();

  const [contactPoints, setContactPoints] = useState<any[]>([]);
  const [contactPointId, setContactPointId] = useState("");
  const [severity, setSeverity] = useState(1);
  const [conditionType, setConditionType] = useState("GT");
  const [action, setAction] = useState("notify");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch(`/api/notification/contact-points/user/${userId}`, {
          credentials: "include",
        });
        const json = await res.json();
        if (json.success) {
          const data = json.data ?? [];
          setContactPoints(data);
          if (data.length > 0) {
            setContactPointId(data[0].id);
          }
        } else {
          toast.error("Không thể tải điểm liên lạc");
        }
      } catch {
        toast.error("Lỗi kết nối đến server");
      }
    };
    fetchContacts();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/notification/policies/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          contact_point_id: contactPointId,
          severity,
          status: "active",
          action,
          condition_type: conditionType,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Tạo chính sách thành công");
        router.push("/alert?tab=policy");
      } else {
        toast.error(data.message || "Tạo thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 p-4">
      <h1 className="text-xl font-semibold mb-4">Tạo chính sách thông báo</h1>

      {contactPoints.length === 0 ? (
        <div className="text-sm text-gray-600">
          Bạn cần tạo ít nhất một <strong>điểm liên lạc</strong> trước khi thêm chính sách thông báo.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Điểm liên lạc</label>
            <select
              value={contactPointId}
              onChange={(e) => setContactPointId(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            >
              {contactPoints.map((cp) => (
                <option key={cp.id} value={cp.id}>
                  {cp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mức độ nghiêm trọng</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full border px-3 py-2 rounded"
            >
              <option value={1}>1 - Thông tin</option>
              <option value={2}>2 - Cảnh cáo</option>
              <option value={3}>3 - Cao</option>
              <option value={4}>4 - Thiên tai</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Toán tử điều kiện</label>
            <select
              value={conditionType}
              onChange={(e) => setConditionType(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="EQ">Bằng (=)</option>
              <option value="NEQ">Khác (!=)</option>
              <option value="GT">Lớn hơn (&gt;)</option>
              <option value="GTE">Lớn hơn hoặc bằng (&ge;)</option>
              <option value="LT">Nhỏ hơn (&lt;)</option>
              <option value="LTE">Nhỏ hơn hoặc bằng (&le;)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hành động</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="notify">Gửi thông báo</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo chính sách"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
