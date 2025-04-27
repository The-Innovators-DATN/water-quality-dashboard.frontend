"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import { Combobox } from "@headlessui/react";
import { useStationStore } from "@/lib/stores/useStationStore";

type Operator = "GT" | "LT" | "EQ" | "OUTSIDE";

export default function NewAlertRulePage() {
  const router = useRouter();
  const { stations, fetchStations, isLoading: loadingStations } = useStationStore();

  const [form, setForm] = useState({
    mode: "template", // 'template' hoặc 'custom'
    name: "",
    station: null as number | null,
    parameter: null as number | null,
    parameterName: "",
    operator: "OUTSIDE" as Operator,
    from: "",
    to: "",
    severity: 3,
    search: "",
    template: "",
  });

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    let payload: any = {
      name: form.name,
      userId: 11, // TODO: Lấy từ session/local
      message: "",
      silenced: 0,
      status: "active",
    };

    if (form.mode === "template") {
      payload.template = form.template;
      payload.message = `Áp dụng cảnh báo mẫu: ${form.template}`;
      // Tuỳ bạn muốn đẩy thêm điều kiện mẫu không
    }

    if (form.mode === "custom") {
      payload.stationId = form.station;
      payload.message = `Thông số ${form.parameterName} vượt ngưỡng tại trạm`;
      payload.conditions = [
        {
          operator: form.operator,
          severity: form.severity,
          metric_id: form.parameter,
          metric_name: form.parameterName,
          threshold: form.operator === "OUTSIDE" ? null : Number(form.from),
          threshold_min: form.operator === "OUTSIDE" ? Number(form.from) : null,
          threshold_max: form.operator === "OUTSIDE" ? Number(form.to) : null,
        },
      ];
    }

    try {
      const res = await fetch("/api/alerts/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Tạo quy tắc thành công!");
        router.push("/alert");
      } else {
        alert("Có lỗi xảy ra!");
        console.error(await res.json());
      }
    } catch (err) {
      console.error("Network error", err);
      alert("Không thể kết nối tới server.");
    }
  };

  return (
    <div className="w-full max-w-3xl px-4 py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-blue-500 hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <h1 className="text-xl font-semibold mb-1">Thêm quy tắc cảnh báo mới</h1>

      <div className="space-y-4 mt-6">
        {/* Tên */}
        <div>
          <label className="block text-sm font-medium mb-1">Tên</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        {/* Chế độ cảnh báo */}
        <div>
          <label className="block text-sm font-medium mb-1">Chế độ cấu hình</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={form.mode}
            onChange={(e) => handleChange("mode", e.target.value)}
          >
            <option value="template">Sử dụng cảnh báo mẫu</option>
            <option value="custom">Tự thiết lập cảnh báo</option>
          </select>
        </div>

        {/* Nếu là cảnh báo mẫu */}
        {form.mode === "template" && (
          <div>
            <label className="block text-sm font-medium mb-1">Chọn cảnh báo mẫu</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={form.template}
              onChange={(e) => handleChange("template", e.target.value)}
            >
              <option value="">Chọn</option>
              <option value="default1">Mẫu 1: Áp suất cao</option>
              <option value="default2">Mẫu 2: TSS tăng nhanh</option>
            </select>
          </div>
        )}

        {/* Nếu là tự thiết lập */}
        {form.mode === "custom" && (
          <>
            {/* Trạm */}
            <div>
              <label className="block text-sm font-medium mb-1">Trạm</label>
              <Combobox value={form.station} onChange={(value) => handleChange("station", value)}>
                {({ open }) => (
                  <div className="relative">
                    <Combobox.Input
                      onChange={(e) => handleChange("search", e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Tìm kiếm tên trạm..."
                      displayValue={(id: number | null) => {
                        const selected = stations.find((s) => s.id === id);
                        return selected ? selected.name : "";
                      }}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-2 flex items-center">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </Combobox.Button>
                    {open && (
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-gray-200 bg-white shadow-lg text-sm">
                        {stations
                          .filter((s) =>
                            s.name.toLowerCase().includes((form.search || "").toLowerCase())
                          )
                          .map((station) => (
                            <Combobox.Option
                              key={station.id}
                              value={station.id}
                              className={({ active }) =>
                                `px-4 py-2 cursor-pointer ${
                                  active ? "bg-blue-100 text-blue-700" : ""
                                }`
                              }
                            >
                              {({ selected }) => (
                                <div className="flex items-center justify-between">
                                  <span>{station.name}</span>
                                  {selected && <Check className="w-4 h-4 text-blue-500" />}
                                </div>
                              )}
                            </Combobox.Option>
                          ))}
                      </Combobox.Options>
                    )}
                  </div>
                )}
              </Combobox>
              {loadingStations && (
                <p className="text-xs text-gray-500 mt-1">Đang tải danh sách trạm...</p>
              )}
            </div>

            {/* Thông số */}
            <div>
              <label className="block text-sm font-medium mb-1">Thông số</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                value={form.parameter || ""}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  const name = e.target.options[e.target.selectedIndex].text;
                  setForm((prev) => ({ ...prev, parameter: value, parameterName: name }));
                }}
              >
                <option value="">Chọn thông số</option>
                <option value={3}>Pressure</option>
                <option value={2}>pH</option>
                <option value={1}>TSS</option>
              </select>
            </div>

            {/* Điều kiện */}
            <div>
              <label className="block text-sm font-medium mb-1">Điều kiện</label>
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  value={form.operator}
                  onChange={(e) => handleChange("operator", e.target.value)}
                >
                  <option value="OUTSIDE">Nằm ngoài khoảng</option>
                  <option value="GT">Lớn hơn</option>
                  <option value="LT">Nhỏ hơn</option>
                  <option value="EQ">Bằng</option>
                </select>

                <input
                  type="number"
                  placeholder="Từ"
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  value={form.from}
                  onChange={(e) => handleChange("from", e.target.value)}
                />

                {form.operator === "OUTSIDE" && <span className="text-sm">đến</span>}

                {form.operator === "OUTSIDE" && (
                  <input
                    type="number"
                    placeholder="Đến"
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                    value={form.to}
                    onChange={(e) => handleChange("to", e.target.value)}
                  />
                )}

                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  value={form.severity}
                  onChange={(e) => handleChange("severity", Number(e.target.value))}
                >
                  <option value={1}>Thấp</option>
                  <option value={2}>Trung bình</option>
                  <option value={3}>Cao</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm"
            onClick={() => router.back()}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
