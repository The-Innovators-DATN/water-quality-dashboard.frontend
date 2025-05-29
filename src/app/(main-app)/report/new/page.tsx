"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/useAuthStore";

type DashboardItem = {
  uid: string;
  name: string;
};

const weekdays = [
  { label: "Chủ nhật", value: 0 },
  { label: "Thứ 2", value: 1 },
  { label: "Thứ 3", value: 2 },
  { label: "Thứ 4", value: 3 },
  { label: "Thứ 5", value: 4 },
  { label: "Thứ 6", value: 5 },
  { label: "Thứ 7", value: 6 },
];

export default function CreateReportPage() {
  const router = useRouter();
  const userId = useAuthStore.getState().getUserId();

  const [dashboards, setDashboards] = useState<DashboardItem[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [hour, setHour] = useState("8");
  const [minute, setMinute] = useState("0");
  const [frequency, setFrequency] = useState("daily");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [dayOfMonth, setDayOfMonth] = useState("1");

  const [emailInput, setEmailInput] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [loadingDashboards, setLoadingDashboards] = useState(true);

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const res = await fetch(`/api/dashboard/dashboards?created_by=${userId}`);
        const result = await res.json();
        setDashboards(result.data?.data?.dashboards || []);
      } catch {
        toast.error("Không thể tải dashboard");
      } finally {
        setLoadingDashboards(false);
      }
    };
    if (userId) fetchDashboards();
  }, [userId]);

  const addEmail = () => {
    const email = emailInput.trim();
    if (!email) return;
    if (recipients.includes(email)) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email không hợp lệ");
      return;
    }
    setRecipients([...recipients, email]);
    setEmailInput("");
  };

  const buildCronExpr = () => {
    const h = parseInt(hour);
    const m = parseInt(minute);
    if (frequency === "daily") return `${m} ${h} * * *`;
    if (frequency === "weekly") return `${m} ${h} * * ${dayOfWeek}`;
    if (frequency === "monthly") return `${m} ${h} ${dayOfMonth} * *`;
    return "0 0 * * *";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !title || !templateId || recipients.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Tạo template từ dashboard
      const createTemplateRes = await fetch("/api/report/schedule-report-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          description: title,
          dashboard_layout: templateId,
          status: "active",
        }),
      });
      const createTemplateResult = await createTemplateRes.json();
      if (!createTemplateRes.ok || !createTemplateResult.data?.id) {
        throw new Error(createTemplateResult.message || "Không thể tạo template");
      }
      const finalTemplateId = createTemplateResult.data.id;

      // 2. Tạo schedule report với template_id mới lấy được
      const cron_expr = buildCronExpr();
      const payload = {
        template_id: finalTemplateId,
        cron_expr,
        timezone: "Asia/Ho_Chi_Minh",
        pre_gen_offset_min: 2,
        title,
        recipients: recipients.join(","),
        user_id: userId,
        status: "active",
      };
      const res = await fetch("/api/report/schedule-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Tạo thất bại");

      toast.success("Tạo báo cáo thành công!");
      router.push("/report");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tạo báo cáo");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tạo báo cáo định kỳ</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Tiêu đề</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Chọn dashboard</label>
          {loadingDashboards ? (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tải...
            </div>
          ) : (
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            >
              <option value="">-- Chọn một dashboard --</option>
              {dashboards.map((d) => (
                <option key={d.uid} value={d.uid}>
                  {d.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Lịch chạy báo cáo</label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col text-sm">
              <span className="mb-1">Tần suất</span>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
              </select>
            </div>

            {frequency === "weekly" && (
              <div className="flex flex-col text-sm">
                <span className="mb-1">Thứ</span>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {weekdays.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {frequency === "monthly" && (
              <div className="flex flex-col text-sm">
                <span className="mb-1">Ngày</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  className="w-20 border rounded px-2 py-1 text-sm"
                />
              </div>
            )}

            <div className="flex flex-col text-sm">
              <span className="mb-1">Giờ</span>
              <input
                type="number"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-20 border rounded px-2 py-1 text-sm"
              />
            </div>

            <div className="flex flex-col text-sm">
              <span className="mb-1">Phút</span>
              <input
                type="number"
                min={0}
                max={59}
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-20 border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Người nhận</label>
          <div className="border rounded px-2 py-2 text-sm flex flex-wrap gap-1 min-h-[42px]">
            {recipients.map((email) => (
              <span key={email} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                {email}
                <button
                  type="button"
                  onClick={() => setRecipients(recipients.filter((e) => e !== email))}
                  className="text-blue-600 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "," || e.key === ";") {
                  e.preventDefault();
                  addEmail();
                }
              }}
              placeholder="Nhập email và nhấn Enter"
              className="flex-1 min-w-[120px] border-none focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin inline-block" /> : "Tạo báo cáo"}
        </button>
      </form>
    </div>
  );
}