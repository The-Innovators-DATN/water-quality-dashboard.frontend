"use client";

import { useEffect, useState } from "react";
import { Loader2, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { usePagination } from "@/lib/hooks/usePagination";
import { useDashboardStore } from "@/lib/stores/useDashboardStore";

type DashboardItem = {
    uid: string;
    name: string;
    description: string;
    createdAt: string;
};

export default function DashboardListPage() {
    const userId = useAuthStore.getState().getUserId();
    const [dashboards, setDashboards] = useState<DashboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!userId) return;
        const fetchDashboards = async () => {
            try {
                const res = await fetch(`/api/dashboard/dashboards?created_by=${userId}`);
                const result = await res.json();
                setDashboards(result.data?.data?.dashboards || []);
            } catch (err) {
                console.error("Lỗi khi fetch dashboards:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboards();
    }, [userId]);

    const {
        currentData: currentDashboards,
        currentPage,
        setCurrentPage,
        totalPages,
        pageNumbers,
        filteredCount,
    } = usePagination(dashboards, 10, (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="w-full p-6">
            <div className="flex items-center mb-6">
                <div className="p-4">
                    <LayoutDashboard className="stroke-blue-400" size={40} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Dashboard của bạn</h1>
                    <p className="text-gray-500">Danh sách dashboard đã tạo</p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <input
                    type="text"
                    placeholder="Tìm theo tên dashboard..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-64"
                />

                <Link href="/dashboard/new" onClick={() => useDashboardStore.getState().reset()}>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600">
                    + Tạo dashboard mới
                    </button>
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-blue-500">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-sm">Đang tải dashboard...</p>
                </div>
            ) : (
                <>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm table-auto">
                    <thead>
                        <tr className="bg-gray-100 text-xs text-gray-600">
                        <th className="px-2 py-2 text-left">Tên</th>
                        <th className="px-2 py-2 text-left">Mô tả</th>
                        <th className="px-2 py-2 text-left">Ngày tạo</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {currentDashboards.map((d) => (
                        <tr key={d.uid} className="border-b hover:bg-gray-50">
                            <td className="px-2 py-2">
                            <Link href={`/dashboard/${d.uid}`} className="text-blue-500 hover:underline">
                                {d.name}
                            </Link>
                            </td>
                            <td className="px-2 py-2 max-w-[240px] truncate" title={d.description}>{d.description}</td>
                            <td className="px-2 py-2">{new Date(d.createdAt).toLocaleString("vi-VN")}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>

                {filteredCount === 0 && (
                    <p className="text-sm text-center text-gray-500 mt-4">Không có dashboard nào phù hợp.</p>
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
    );
}