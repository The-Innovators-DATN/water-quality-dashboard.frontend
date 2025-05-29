"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import { Combobox } from "@headlessui/react";
import { useStationStore } from "@/lib/stores/useStationStore";
import { useAuthStore } from "@/lib/stores/useAuthStore";

type Operator = "EQ" | "NEQ" | "GT" | "GTE" | "LT" | "LTE" | "RANGE" | "OUTSIDE_RANGE";

export default function NewAlertRulePage() {
  const userId = useAuthStore.getState().getUserId();
  const router = useRouter();
  const { stations, fetchStations, isLoading: loadingStations } = useStationStore();

  const [form, setForm] = useState({
    name: "",
    message: "",
    station: null as number | null,
    status: "active" as "active" | "inactive" | "deleted",
    silenced: 0,
    operator: "OUTSIDE" as Operator,
    from: "",
    to: "",
    severity: 3,
    search: "",
    conditions: [{
      parameterId: null,
      operator: "GT",
      threshold: 0,
      severity: 1,
    }] as {
      parameterId: number | null,
      operator: Operator,
      threshold: number,
      threshold_min?: number,
      threshold_max?: number,
      severity: number
    }[],
  });

  const [availableParameters, setAvailableParameters] = useState<{
    id: number
    name: string
    unit: string
    parameterGroup: string
    description: string
  }[]>([]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  useEffect(() => {
    if (!form.station) return;

    fetch("/api/dashboard/station_parameters/by_target", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_type: "STATION",
        target_id: form.station,
      }),
    })
      .then(res => res.json())
      .then(json => {
        if (json?.data?.parameters && Array.isArray(json.data.parameters)) {
          setAvailableParameters(json.data.parameters);
        } else {
          console.error("Invalid parameter response:", json);
        }
      })
      .catch(err => console.error("Failed to fetch station parameters:", err));
  }, [form.station]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    let payload: any = {
      name: form.name,
      // userId: userId,
      stationId: form.station,
      message: form.message,
      silenced: form.silenced,
      status: form.status,
      conditions: form.conditions.map((c) => ({
        metric_id: c.parameterId,
        metric_name: null,
        operator: c.operator,
        threshold: ["RANGE", "OUTSIDE_RANGE"].includes(c.operator) ? undefined : c.threshold,
        threshold_min: ["RANGE", "OUTSIDE_RANGE"].includes(c.operator) ? c.threshold_min : null,
        threshold_max: ["RANGE", "OUTSIDE_RANGE"].includes(c.operator) ? c.threshold_max : null,
        severity: c.severity,
      })),
    };

    try {
      const res = await fetch(`/api/alert/create/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
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
      <h1 className="text-xl font-semibold mb-1">Thêm quy tắc cảnh báo mới</h1>

      <div className="space-y-4 mt-6">
        <div>
          <label className="block text-sm font-medium mb-1">Tên</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Thông báo</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={form.message}
            onChange={(e) => handleChange("message", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Im lặng</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={form.silenced}
            onChange={(e) => handleChange("silenced", parseInt(e.target.value))}
          >
            <option value={0}>Không</option>
            <option value={1}>Có</option>
          </select>
        </div>
            
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
                      .slice(0, 50)
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

        <div>
          <label className="block text-sm font-medium mb-1">Điều kiện</label>
          <table className="w-full table-auto border text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Chỉ số</th>
                <th className="p-2 border">Toán tử</th>
                <th className="p-2 border">Ngưỡng</th>
                <th className="p-2 border">Mức độ</th>
                <th className="p-2 border w-20">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {form.conditions.map((cond, i) => (
                <tr key={i} className="border-t">
                  <td className="p-1 border">
                    <select
                      className="w-full px-2 py-1 border rounded"
                      value={cond.parameterId ?? ""}
                      onChange={(e) => {
                        const conditions = [...form.conditions];
                        conditions[i].parameterId = parseInt(e.target.value);
                        setForm({ ...form, conditions });
                      }}
                    >
                      <option value="">-- chọn --</option>
                      {availableParameters.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1 border">
                    <select
                      className="w-full px-2 py-1 border rounded"
                      value={cond.operator}
                      onChange={(e) => {
                        const conditions = [...form.conditions];
                        conditions[i].operator = e.target.value as Operator;
                        setForm({ ...form, conditions });
                      }}
                    >
                      <option value="EQ">EQ</option>
                      <option value="NEQ">NEQ</option>
                      <option value="GT">GT</option>
                      <option value="GTE">GTE</option>
                      <option value="LT">LT</option>
                      <option value="LTE">LTE</option>
                      <option value="RANGE">RANGE</option>
                      <option value="OUTSIDE_RANGE">OUTSIDE_RANGE</option>
                    </select>
                  </td>
                  <td className="p-1 border">
                    {["RANGE", "OUTSIDE_RANGE"].includes(cond.operator) ? (
                      <div className="flex gap-1">
                        <input
                          type="number"
                          className="w-1/2 px-2 py-1 border rounded"
                          placeholder="Min"
                          value={cond.threshold_min ?? ""}
                          onChange={(e) => {
                            const conditions = [...form.conditions];
                            conditions[i].threshold_min = parseFloat(e.target.value);
                            setForm({ ...form, conditions });
                          }}
                        />
                        <input
                          type="number"
                          className="w-1/2 px-2 py-1 border rounded"
                          placeholder="Max"
                          value={cond.threshold_max ?? ""}
                          onChange={(e) => {
                            const conditions = [...form.conditions];
                            conditions[i].threshold_max = parseFloat(e.target.value);
                            setForm({ ...form, conditions });
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        type="number"
                        className="w-full px-2 py-1 border rounded"
                        value={cond.threshold}
                        onChange={(e) => {
                          const conditions = [...form.conditions];
                          conditions[i].threshold = parseFloat(e.target.value);
                          setForm({ ...form, conditions });
                        }}
                      />
                    )}
                  </td>
                  <td className="p-1 border">
                    <input
                      type="number"
                      className="w-full px-2 py-1 border rounded"
                      value={cond.severity}
                      onChange={(e) => {
                        const conditions = [...form.conditions];
                        conditions[i].severity = parseInt(e.target.value);
                        setForm({ ...form, conditions });
                      }}
                    />
                  </td>
                  <td className="p-1 border text-center">
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => {
                        const conditions = form.conditions.filter((_, idx) => idx !== i);
                        setForm({ ...form, conditions });
                      }}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                conditions: [
                  ...prev.conditions,
                  {
                    parameterId: null,
                    operator: "GT",
                    threshold: 0,
                    severity: 1,
                  },
                ],
              }))
            }
            className="mt-2 text-blue-600 text-sm hover:underline"
          >
            + Thêm điều kiện
          </button>
        </div>

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
