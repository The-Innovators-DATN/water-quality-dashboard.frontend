"use client";

import { useState, useEffect, Fragment } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, Transition, DialogPanel, DialogTitle } from "@headlessui/react";
import { useStationStore } from "@/lib/stores/useStationStore";
import { useAuthStore } from "@/lib/stores/useAuthStore";

const TABS = [
  { id: "sent", label: "Các thông báo đã gửi" },
  { id: "contact-points", label: "Điểm liên lạc" },
  { id: "rules", label: "Quy tắc cảnh báo" },
  { id: "policy", label: "Chính sách thông báo" },
] as const;

type TabType = typeof TABS[number]["id"];

const userId: number | null = useAuthStore.getState().getUserId();

export default function AlertPage() {
  const [activeTab, setActiveTab] = useState<TabType>("sent");

  return (
    <div className="w-full px-4 md:px-6 pt-4">
      <div className="flex items-center mb-6">
        <div className="p-4">
          <Bell className="stroke-blue-400" size={40} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Cảnh báo</h1>
          <p className="text-gray-500">Những quy tắc cảnh báo và thông báo</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between mb-4 text-sm gap-2">
        <div className="flex gap-4 border-b">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "rules" && (
          <Link href="/alert/rules/new">
            <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded flex items-center">
              <Plus className="w-4 h-4 mr-1" />
              Quy tắc mới
            </button>
          </Link>
        )}
        {activeTab === "contact-points" && (
          <Link href="/alert/contact-points/new">
            <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded flex items-center">
              <Plus className="w-4 h-4 mr-1" />
              Thêm điểm liên lạc
            </button>
          </Link>
        )}
        {activeTab === "policy" && (
          <Link href="/alert/policies/new">
            <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded flex items-center">
              <Plus className="w-4 h-4 mr-1" />
              Chính sách mới
            </button>
          </Link>
        )}
      </div>

      <div className="text-sm text-gray-700">
        {activeTab === "sent" && <SentAlerts />}
        {activeTab === "contact-points" && <ContactPoints />}
        {activeTab === "rules" && <AlertRules />}
        {activeTab === "policy" && <NotificationPolicy />}
      </div>
    </div>
  );
}

function SentAlerts() {
  return <div className="p-2 text-gray-600">Danh sách các cảnh báo đã gửi.</div>;
}

function ContactPoints() {
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const onDelete = async () => {
    if (!openId) return;
    setDeletingId(openId);
    try {
      const res = await fetch(`/api/notification/contact-points/${openId}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (res.status === 204) {
        toast.success("Xoá điểm liên lạc thành công");
        setContacts((prev) => prev.filter((c) => c.id !== openId));
        setOpenId(null);
      } else {
        const error = await res.json();
        toast.error(error.message || "Xoá thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến server");
    } finally {
      setDeletingId(null);
    }
  };      

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch(`/api/notification/contact-points/user/${userId}`, {
          credentials: "include",
        });
        const json = await res.json();
        if (json.success) {
          setContacts(json.data ?? []);
        }
      } catch (err) {
        toast.error("Không thể tải điểm liên lạc");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const paginatedContacts = contacts.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(contacts.length / perPage);

  return (
    <>
      <div className="p-2 text-gray-700">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-gray-500 text-sm">Đang tải dữ liệu...</div>
            </div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-gray-500 text-sm">Không có điểm liên lạc nào.</div>
        ) : (
          <>
            <table className="w-full table-auto text-sm mb-4">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">Tên</th>
                  <th className="p-2">Loại</th>
                  <th className="p-2">Trạng thái</th>
                  <th className="p-2 w-24">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: perPage }).map((_, i) => {
                  const contact = paginatedContacts[i];
                  return contact ? (
                    <tr key={contact.id} className="border-b hover:bg-gray-100">
                      <td className="p-2 max-w-[200px] truncate">
                        <button
                          onClick={() => router.push(`/alert/contact-points/${contact.id}`)}
                          className="text-left w-full hover:underline text-blue-600"
                        >
                          {contact.name}
                        </button>
                      </td>
                      <td className="p-2 capitalize">{contact.type}</td>
                      <td className="p-2">
                        {contact.status === "active" ? (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">
                            Không hoạt động
                          </span>
                        )}
                      </td>
                      <td className="p-2 w-24 flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenId(contact.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={`empty-${i}`} className="border-b">
                      <td className="p-2" colSpan={4}>&nbsp;</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="px-2 py-1 border rounded disabled:text-gray-400"
              >
                Đầu
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded border ${i + 1 === page ? "bg-blue-500 text-white" : "bg-white"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                className="px-2 py-1 border rounded disabled:text-gray-400"
              >
                Cuối
              </button>
            </div>
          </>
        )}
      </div>

      <Transition appear show={openId !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setOpenId(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className={`w-full max-w-sm transform transition-all ${deletingId === openId ? "bg-transparent" : "bg-white overflow-hidden rounded p-6 text-left align-middle shadow-xl"}`}>
                  {deletingId === openId ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      <DialogTitle className="text-lg font-medium text-gray-900">Xác nhận xoá</DialogTitle>
                      <div className="mt-2 text-sm text-gray-600">
                        Bạn có chắc muốn xoá điểm liên lạc này? Thao tác không thể hoàn tác.
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          className="px-4 py-1 text-sm border rounded"
                          onClick={() => setOpenId(null)}
                        >
                          Huỷ
                        </button>
                        <button
                          className="px-4 py-1 text-sm bg-red-600 text-white rounded flex items-center justify-center"
                          onClick={onDelete}
                        >
                          Xoá
                        </button>
                      </div>
                    </>
                  )}
                </DialogPanel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function AlertRules() {
  const router = useRouter();
  const userId = useAuthStore.getState().getUserId();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const [alerts, setAlerts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const perPage = 10;

  const { stationMap, fetchStations } = useStationStore();

  useEffect(() => {
    if (Object.keys(stationMap).length === 0) fetchStations();

    const fetchAlerts = async () => {
      setIsLoading(true);
      const res = await fetch(`/api/alert/get/user/${userId}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setAlerts(json.data);
      }
      setIsLoading(false);
    };
    fetchAlerts();
  }, []);

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      active: "Đang hoạt động",
      inactive: "Không hoạt động",
      deleted: "Đã xoá",
    };

    const colorMap: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-yellow-100 text-yellow-700",
      deleted: "bg-red-100 text-red-700",
    };

    return (
      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${colorMap[status] || "bg-gray-100 text-gray-600"}`}>
        {labelMap[status] || status}
      </span>
    );
  };

  const handleClick = (uid: string) => {
    router.push(`/alert/rules/${uid}`);
  };

  const onDelete = async (uid: string) => {
    setDeletingId(uid);
    try {
      const res = await fetch(`/api/alert/delete/${uid}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Xoá cảnh báo thành công");
        setAlerts((prev) => prev.filter((a) => a.uid !== uid));
        setOpenId(null);
      } else {
        toast.error(json.message || "Xoá thất bại");
      }
    } catch {
      toast.error("Lỗi khi xoá cảnh báo");
    } finally {
      setDeletingId(null);
    }
  };

  const visibleAlerts = alerts.filter(alert => alert.status !== "deleted");
  const paginatedAlerts = visibleAlerts.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setTotalPages(Math.ceil(visibleAlerts.length / perPage));
  }, [visibleAlerts.length]);

  return (
    <div className="p-2 text-gray-700">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-gray-500 text-sm">Đang tải dữ liệu...</div>
          </div>
        </div>
      ) : (
        <>
          <table className="w-full table-auto text-sm mb-4">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Tên</th>
                <th className="p-2">Trạm</th>
                <th className="p-2">Trạng thái</th>
                <th className="p-2">Cập nhật</th>
                <th className="p-2 w-24">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: perPage }).map((_, i) => {
                const alert = paginatedAlerts[i];
                return alert ? (
                  <tr key={alert.uid} className="border-b hover:bg-gray-100">
                    <td className="p-2 max-w-[200px] truncate">
                      <button
                        onClick={() => handleClick(alert.uid)}
                        className="text-left w-full hover:underline text-blue-600"
                      >
                        {alert.name}
                      </button>
                    </td>
                    <td className="p-2">{stationMap[alert.stationId] ?? "Không rõ"}</td>
                    <td className="p-2">{getStatusLabel(alert.status)}</td>
                    <td className="p-2">{new Date(alert.updatedAt).toLocaleString()}</td>
                    <td className="p-2 w-24 flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenId(alert.uid);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={`empty-${i}`} className="border-b">
                    <td className="p-2" colSpan={5}>&nbsp;</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => router.push(`?page=1`)}
              className="px-2 py-1 border rounded disabled:text-gray-400"
            >
              Đầu
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => router.push(`?page=${i + 1}`)}
                className={`px-3 py-1 rounded border ${i + 1 === page ? "bg-blue-500 text-white" : "bg-white"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => router.push(`?page=${totalPages}`)}
              className="px-2 py-1 border rounded disabled:text-gray-400"
            >
              Cuối
            </button>
          </div>

          <Transition appear show={openId !== null} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setOpenId(null)}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <DialogPanel className={`w-full max-w-sm transform transition-all ${deletingId === openId ? "bg-transparent" : "bg-white overflow-hidden rounded p-6 text-left align-middle shadow-xl"}`}>
                      {deletingId === openId ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <>
                          <DialogTitle className="text-lg font-medium text-gray-900">Xác nhận xoá</DialogTitle>
                          <div className="mt-2 text-sm text-gray-600">
                            Bạn có chắc muốn xoá cảnh báo này? Thao tác không thể hoàn tác.
                          </div>
                          <div className="mt-4 flex justify-end gap-2">
                            <button
                              className="px-4 py-1 text-sm border rounded"
                              onClick={() => setOpenId(null)}
                            >
                              Huỷ
                            </button>
                            <button
                              className="px-4 py-1 text-sm bg-red-600 text-white rounded flex items-center justify-center"
                              onClick={() => {
                                if (openId) {
                                  onDelete(openId);
                                }
                              }}
                            >
                              Xoá
                            </button>
                          </div>
                        </>
                      )}
                    </DialogPanel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </>
      )}
    </div>
  );
}

function NotificationPolicy() {
  const router = useRouter();
  const userId = useAuthStore.getState().getUserId();
  const [policies, setPolicies] = useState<any[]>([]);
  const [contactsMap, setContactsMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const perPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [policyRes, contactsRes] = await Promise.all([
          fetch(`/api/notification/policies/user/${userId}`, {
            credentials: "include",
          }),
          fetch(`/api/notification/contact-points/user/${userId}`, {
            credentials: "include",
          }),
        ]);

        const [policyJson, contactsJson] = await Promise.all([
          policyRes.json(),
          contactsRes.json(),
        ]);

        if (policyJson.success && contactsJson.success) {
          setPolicies(policyJson.data ?? []);

          const map: Record<string, string> = {};
          for (const contact of contactsJson.data ?? []) {
            map[contact.id] = contact.name;
          }
          setContactsMap(map);
        } else {
          toast.error("Không thể tải dữ liệu chính sách hoặc điểm liên lạc");
        }
      } catch (err) {
        console.log(err);
        toast.error("Lỗi kết nối đến server");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const onDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/notification/policies/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Xoá chính sách thông báo thành công");
        setPolicies((prev) => prev.filter((policy) => policy.id !== id));
        setOpenId(null);
      } else {
        const error = await res.json();
        toast.error(error.message || "Xoá thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến server");
    } finally {
      setDeletingId(null);
    }
  };

  const paginatedPolicies = policies.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(policies.length / perPage);

  return (
    <div className="p-2 text-gray-700">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-gray-500 text-sm">Đang tải dữ liệu...</div>
          </div>
        </div>
      ) : policies.length === 0 ? (
        <div className="text-gray-500 text-sm">Không có chính sách thông báo nào.</div>
      ) : (
        <>
          <table className="w-full table-auto text-sm mb-4">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Điểm liên lạc</th>
                <th className="p-2">Trạng thái</th>
                <th className="p-2">Cập nhật lúc</th>
                <th className="p-2 w-24">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: perPage }).map((_, i) => {
                const policy = paginatedPolicies[i];
                return policy ? (
                  <tr key={policy.id} className="border-b hover:bg-gray-100">
                    <td className="p-2 max-w-[200px] truncate">
                      <button
                        onClick={() => router.push(`/alert/policies/${policy.id}`)}
                        className="text-left w-full hover:underline text-blue-600"
                      >
                        {contactsMap[policy.contact_point_id] ?? "Không rõ"}
                      </button>
                    </td>
                    <td className="p-2">
                      {policy.status === "active" ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">
                          Không hoạt động
                        </span>
                      )}
                    </td>
                    <td className="p-2">{new Date(policy.updated_at).toLocaleString()}</td>
                    <td className="p-2 w-24 flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenId(policy.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={`empty-${i}`} className="border-b">
                    <td className="p-2" colSpan={4}>&nbsp;</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(1)}
              className="px-2 py-1 border rounded disabled:text-gray-400"
            >
              Đầu
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded border ${i + 1 === page ? "bg-blue-500 text-white" : "bg-white"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(totalPages)}
              className="px-2 py-1 border rounded disabled:text-gray-400"
            >
              Cuối
            </button>
          </div>

          {/* Delete confirmation dialog */}
          <Transition appear show={openId !== null} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setOpenId(null)}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <DialogPanel className={`w-full max-w-sm transform transition-all ${deletingId === openId ? "bg-transparent" : "bg-white overflow-hidden rounded p-6 text-left align-middle shadow-xl"}`}>
                      {deletingId === openId ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <>
                          <DialogTitle className="text-lg font-medium text-gray-900">Xác nhận xoá</DialogTitle>
                          <div className="mt-2 text-sm text-gray-600">
                            Bạn có chắc muốn xoá chính sách thông báo này? Thao tác không thể hoàn tác.
                          </div>
                          <div className="mt-4 flex justify-end gap-2">
                            <button
                              className="px-4 py-1 text-sm border rounded"
                              onClick={() => setOpenId(null)}
                            >
                              Huỷ
                            </button>
                            <button
                              className="px-4 py-1 text-sm bg-red-600 text-white rounded flex items-center justify-center"
                              onClick={() => {
                                if (openId) onDelete(openId);
                              }}
                            >
                              Xoá
                            </button>
                          </div>
                        </>
                      )}
                    </DialogPanel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </>
      )}
    </div>
  );
}
