"use client";

import { useEffect, useState } from "react";
import { Loader2, FileText, Trash } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { usePagination } from "@/lib/hooks/usePagination";

type ReportItem = {
  id: string;
  template_id: string;
  cron_expr: string;
  timezone: string;
  pre_gen_offset_min: number;
  title: string;
  recipients: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function ReportListPage() {
  const router = useRouter();
  const userId = useAuthStore.getState().getUserId();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDeleteReport = async (id: string) => {
    if (!id || !userId) return;
    setLoadingDelete(true);

    try {
      const res = await fetch(`/api/report/schedule-reports/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Xóa báo cáo thất bại");
      }

      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success("Xóa báo cáo thành công!");
    } catch (err) {
      console.error("Lỗi khi xóa báo cáo:", err);
      toast.error("Xóa báo cáo thất bại!");
    } finally {
      setLoadingDelete(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    const fetchReports = async () => {
      try {
        const res = await fetch(`/api/report/schedule-reports/user/${userId}`);
        const result = await res.json();
        setReports(result.data || []);
      } catch (err) {
        console.error("Lỗi khi fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [userId]);

  const {
    currentData,
    currentPage,
    setCurrentPage,
    totalPages,
    pageNumbers,
    filteredCount,
  } = usePagination(reports, 10, (r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Pagination = ({ current, setCurrent, total, pages }: any) => (
    <div className="mt-4 flex justify-center gap-1 text-sm flex-wrap">
      <button onClick={() => setCurrent(1)} disabled={current === 1} className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">Đầu</button>
      <button onClick={() => setCurrent(Math.max(1, current - 1))} className="px-2 py-1 border rounded hover:bg-gray-100">«</button>
      {pages.map((page: number) => (
        <button key={page} onClick={() => setCurrent(page)} className={`px-3 py-1 border rounded ${current === page ? "bg-blue-500 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>{page}</button>
      ))}
      <button onClick={() => setCurrent(Math.min(total, current + 1))} className="px-2 py-1 border rounded hover:bg-gray-100">»</button>
      <button onClick={() => setCurrent(total)} disabled={current === total} className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">Cuối</button>
    </div>
  );

  return (
    <>
      {loadingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      )}

      <Dialog open={isOpen && !loadingDelete} onClose={() => setIsOpen(false)} className="relative z-40">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-sm rounded bg-white p-6">
            <DialogTitle className="text-lg font-bold">Xác nhận xóa</DialogTitle>
            <Description className="text-sm text-gray-500 mt-2">
              Bạn có chắc chắn muốn xóa báo cáo này không? Hành động này không thể hoàn tác.
            </Description>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300">
                Hủy
              </button>
              <button
                onClick={async () => {
                  if (selectedId) {
                    await handleDeleteReport(selectedId);
                  }
                  setIsOpen(false);
                }}
                className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <div className="w-full p-6">
        <div className="flex items-center mb-6">
          <div className="p-4">
            <FileText className="stroke-blue-400" size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Báo cáo định kỳ</h1>
            <p className="text-gray-500">Danh sách báo cáo định kỳ đã tạo</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <input
            type="text"
            placeholder="Tìm theo tiêu đề..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-64"
          />
          <Link href="/report/new">
            <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600">
              Tạo báo cáo định kỳ mới
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-blue-500">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p className="text-sm">Đang tải báo cáo định kỳ...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm table-auto">
                <thead>
                  <tr className="bg-gray-100 text-xs text-gray-600">
                    <th className="px-2 py-2 text-left">Tiêu đề</th>
                    <th className="px-2 py-2 text-left">Trạng thái</th>
                    <th className="px-2 py-2 text-left">Ngày tạo</th>
                    <th className="px-2 py-2 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {currentData.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/report/${r.id}`)}
                    >
                      <td className="px-2 py-2">{r.title}</td>
                      <td className="px-2 py-2 capitalize">
                        {r.status === "active" ? "Đang hoạt động" : "Không hoạt động"}
                      </td>
                      <td className="px-2 py-2">{new Date(r.created_at).toLocaleString("vi-VN")}</td>
                      <td className="px-2 py-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(r.id);
                            setIsOpen(true);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Xóa báo cáo"
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCount === 0 && (
              <p className="text-sm text-center text-gray-500 mt-4">Không có báo cáo định kỳ</p>
            )}

            {totalPages > 1 && (
              <Pagination
                current={currentPage}
                setCurrent={setCurrentPage}
                total={totalPages}
                pages={pageNumbers}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
