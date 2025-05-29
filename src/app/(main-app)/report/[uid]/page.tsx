"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function UpdateReportPage() {
  const router = useRouter();
  const { uid: reportId } = useParams();
  const userId = useAuthStore.getState().getUserId();

  const [dashboards, setDashboards] = useState<DashboardItem[]>([]);
  const [dashboardId, setDashboardId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [hour, setHour] = useState("8");
  const [minute, setMinute] = useState("0");
  const [frequency, setFrequency] = useState("daily");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [dayOfMonth, setDayOfMonth] = useState("1");

  const [emailInput, setEmailInput] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userId || !reportId) return;

    const fetchDashboards = async () => {
      try {
        const res = await fetch(`/api/dashboard/dashboards?created_by=${userId}`);
        const result = await res.json();
        setDashboards(result.data?.data?.dashboards || []);
        return result.data?.data?.dashboards || [];
      } catch {
        toast.error("Không thể tải dashboard");
        return [];
      }
    };

    const fetchReportAndTemplate = async (dashboardsList: DashboardItem[]) => {
      try {
        const resReport = await fetch(`/api/report/schedule-reports/${reportId}`);
        if (!resReport.ok) throw new Error("Không tìm thấy báo cáo");
        const reportData = (await resReport.json()).data;

        setTitle(reportData.title || "");
        setRecipients(reportData.recipients ? reportData.recipients.split(",") : []);

        const parts = reportData.cron_expr.split(" ");
        if (parts.length === 5) {
          const [min, hr, dayM, mon, dayW] = parts;
          if (dayM !== "*" && dayW === "*") {
            setFrequency("monthly");
            setDayOfMonth(dayM);
          } else if (dayW !== "*") {
            setFrequency("weekly");
            setDayOfWeek(dayW);
          } else {
            setFrequency("daily");
          }
          setHour(hr || "8");
          setMinute(min || "0");
        }

        const templateId = reportData.template_id;

        const resTemplate = await fetch(`/api/report/schedule-report-templates/${templateId}`);
        if (!resTemplate.ok) throw new Error("Không tìm thấy template");
        const templateData = await resTemplate.json();

        const dashboardId = templateData.data.dashboard_layout;

        setTemplateId(templateId);
        setDashboardId(dashboardId);
      } catch (err: any) {
        toast.error(err.message || "Lỗi khi tải dữ liệu");
        router.push("/report");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards().then((dashboardsList) => {
      fetchReportAndTemplate(dashboardsList);
    });
  }, [userId, reportId]);

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

  const handleDashboardChange = async (newDashboardId: string) => {
    setDashboardId(newDashboardId);

    try {
      const res = await fetch(`/api/report/schedule-report-templates/user/${userId}`);
      if (!res.ok) throw new Error("Lỗi lấy template");
      const result = await res.json();

      const foundTemplate = result.data?.find(
        (t: any) => t.dashboard_layout === newDashboardId
      );

      if (foundTemplate) {
        setTemplateId(foundTemplate.id);
      } else {
        const createRes = await fetch("/api/report/schedule-report-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            description: title,
            dashboard_layout: newDashboardId,
            status: "active",
          }),
        });
        if (!createRes.ok) throw new Error("Lỗi tạo template");
        const createResult = await createRes.json();
        setTemplateId(createResult.data.id);
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xử lý template");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !title || !templateId || recipients.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setSubmitting(true);

    try {
      const cron_expr = buildCronExpr();
      const payload = {
        template_id: templateId,
        cron_expr,
        timezone: "Asia/Ho_Chi_Minh",
        pre_gen_offset_min: 2,
        title,
        recipients: recipients.join(","),
        user_id: userId,
        status: "active",
      };

      const res = await fetch(`/api/report/schedule-reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Cập nhật thất bại");

      toast.success("Cập nhật báo cáo thành công!");
      router.push("/report");
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi cập nhật báo cáo");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cập nhật báo cáo định kỳ</h1>

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
          <select
            value={dashboardId}
            onChange={(e) => handleDashboardChange(e.target.value)}
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
              <span
                key={email}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1"
              >
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
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Cập nhật báo cáo
        </button>
      </form>
    </div>
  );
}