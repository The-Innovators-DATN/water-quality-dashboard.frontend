'use client';

import { useEffect, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { useStationStore } from "@/lib/stores/useStationStore";
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAlertStore } from '@/lib/stores/useAlertStore';

type Operator = "EQ" | "NEQ" | "GT" | "GTE" | "LT" | "LTE" | "RANGE" | "OUTSIDE_RANGE";

interface Condition {
  uid?: string;
  metric_id: number | null;
  metric_name: string | null;
  operator: Operator;
  threshold: number;
  threshold_min?: number | null;
  threshold_max?: number | null;
  severity: number;
}

interface Alert {
  uid: string;
  name: string;
  message: string;
  status: string;
  stationId: number;
  userId: number;
  silenced: number;
  createdAt: string;
  updatedAt: string;
  conditions: Condition[];
}

export default function AlertDetail() {
  const { uid } = useParams();
  const [data, setData] = useState<Alert | null>(null);
  const [isLoadingAlert, setIsLoadingAlert] = useState(true);
  const [isLoadingParams, setIsLoadingParams] = useState(true);
  const loading = isLoadingAlert || isLoadingParams;
  const [isSaving, setIsSaving] = useState(false);
  const { stations, fetchStations } = useStationStore();
  const [query, setQuery] = useState('');
  const [availableParameters, setAvailableParameters] = useState<{ id: number; name: string }[]>([]);
  const { setAlert } = useAlertStore();

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoadingAlert(true);
      const res = await fetch(`/api/alert/get/user/11`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        const alert = json.data.find((a: Alert) => a.uid === uid);
        if (alert) {
          setData({
            ...alert,
            conditions: alert.conditions.map((c: Condition) => ({
              uid: c.uid,
              metric_id: c.metric_id ?? null,
              metric_name: c.metric_name ?? null,
              operator: c.operator as Operator,
              threshold: c.threshold,
              threshold_min: c.threshold_min,
              threshold_max: c.threshold_max,
              severity: c.severity,
            }))
          });
          setAlert(alert);
        }
      }
      setIsLoadingAlert(false);
    };
    fetchDetail();
    if (stations.length === 0) fetchStations();
  }, [uid]);

  useEffect(() => {
    if (!data?.stationId) return;
    setIsLoadingParams(true);
    fetch("/api/dashboard/station_parameters/by_target", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_type: "STATION",
        target_id: data.stationId,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.parameters) {
          setAvailableParameters(json.data.parameters);
        }
        setIsLoadingParams(false);
      })
      .catch((err) => {
        console.error("Failed to fetch parameters", err);
        setIsLoadingParams(false);
      });
  }, [data?.stationId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-500 text-sm">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-red-500">Không tìm thấy cảnh báo.</div>;
  }

  return (
    <div className="relative">
      {isSaving && (
        <div className="absolute inset-0 z-50 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="p-4 space-y-4 text-gray-700">
      <h1 className="text-xl font-semibold">Chỉnh sửa cảnh báo</h1>

      <div className="space-y-2">
        <label className="block">
          <span className="text-sm font-medium">Tên</span>
          <input
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Thông báo</span>
          <input
            value={data.message}
            onChange={(e) => setData({ ...data, message: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Trạng thái</span>
          <select
            value={data.status}
            onChange={(e) => setData({ ...data, status: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
          >
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Trạm</span>
          <Combobox value={data.stationId ?? 0} onChange={(id: number) => setData({ ...data, stationId: id })}>
            <div className="relative mt-1">
              <Combobox.Input
                className="w-full border border-gray-300 rounded px-2 py-1"
                displayValue={(id: number) => stations.find((s) => s.id === id)?.name || ''}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white shadow border border-gray-200">
                {(query === ''
                  ? stations
                  : stations.filter((s) =>
                      s.name.toLowerCase().includes(query.toLowerCase())
                    )
                ).map((s) => (
                  <Combobox.Option key={s.id} value={s.id} className="cursor-pointer px-2 py-1 hover:bg-blue-100">
                    {s.name}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Im lặng</span>
          <select
            value={data.silenced}
            onChange={(e) => setData({ ...data, silenced: Number(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
          >
            <option value={0}>Không</option>
            <option value={1}>Có</option>
          </select>
        </label>

        <div>
          <p className="text-sm font-semibold mb-2">Điều kiện</p>
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
              {data.conditions.map((cond, i) => (
                <tr key={cond.uid || i} className="border-t">
                  <td className="p-1 border">
                    <select
                      className="w-full px-2 py-1 border rounded"
                      value={cond.metric_id ?? ""}
                      onChange={(e) => {
                        const c = [...data.conditions];
                        c[i].metric_id = parseInt(e.target.value);
                        setData({ ...data, conditions: c });
                      }}
                    >
                      <option value="">Chọn chỉ số</option>
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
                        const c = [...data.conditions];
                        c[i].operator = e.target.value as Operator;
                        setData({ ...data, conditions: c });
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
                          value={cond.threshold_min ?? ''}
                          onChange={(e) => {
                            const c = [...data.conditions];
                            c[i].threshold_min = parseFloat(e.target.value);
                            setData({ ...data, conditions: c });
                          }}
                        />
                        <input
                          type="number"
                          className="w-1/2 px-2 py-1 border rounded"
                          placeholder="Max"
                          value={cond.threshold_max ?? ''}
                          onChange={(e) => {
                            const c = [...data.conditions];
                            c[i].threshold_max = parseFloat(e.target.value);
                            setData({ ...data, conditions: c });
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        type="number"
                        className="w-full px-2 py-1 border rounded"
                        value={cond.threshold}
                        onChange={(e) => {
                          const c = [...data.conditions];
                          c[i].threshold = parseFloat(e.target.value);
                          setData({ ...data, conditions: c });
                        }}
                      />
                    )}
                  </td>
                  <td className="p-1 border">
                    <input
                      type="number"
                      className="w-full px-2 py-1 border rounded"
                      value={cond.severity ?? ''}
                      onChange={(e) => {
                        const c = [...data.conditions];
                        c[i].severity = parseInt(e.target.value);
                        setData({ ...data, conditions: c });
                      }}
                    />
                  </td>
                  <td className="p-1 border text-center">
                    <button
                      className="text-red-500 hover:underline disabled:text-gray-300"
                      onClick={() => {
                        const newConds = data.conditions.filter((_, idx) => idx !== i);
                        setData({ ...data, conditions: newConds });
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
            onClick={() => {
              const updated = [
                ...data.conditions,
                {
                  metric_id: null,
                  metric_name: null,
                  operator: "EQ" as Operator,
                  threshold: 0,
                  threshold_min: null,
                  threshold_max: null,
                  severity: 1,
                },
              ];
              setData({ ...data, conditions: updated });
            }}
            className="mt-2 text-blue-600 text-sm hover:underline"
          >
            + Thêm điều kiện
          </button>
        </div>
      </div>

      <button
        disabled={isSaving}
        onClick={async () => {
          setIsSaving(true);
          try {
            const res = await fetch(`/api/alert/update/${uid}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                name: data.name,
                stationId: data.stationId,
                message: data.message,
                conditions: data.conditions.map(({ metric_id, operator, threshold, threshold_min, threshold_max, severity }) => ({
                  metric_id,
                  metric_name: availableParameters.find(p => p.id === metric_id)?.name || null,
                  operator,
                  threshold: ["RANGE", "OUTSIDE_RANGE"].includes(operator) ? undefined : threshold,
                  threshold_min: ["RANGE", "OUTSIDE_RANGE"].includes(operator) ? threshold_min : null,
                  threshold_max: ["RANGE", "OUTSIDE_RANGE"].includes(operator) ? threshold_max : null,
                  severity,
                })),
                silenced: data.silenced,
                status: data.status,
              }),
            });

            if (!res.ok) throw new Error();

            toast.success('Cập nhật cảnh báo thành công!');
          } catch {
            toast.error('Cập nhật thất bại. Vui lòng thử lại.');
          } finally {
            setIsSaving(false);
          }
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
      >
        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
      </div>
    </div>
  );
}