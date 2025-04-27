"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Plus } from "lucide-react";

const TABS = [
  { id: "sent", label: "Các cảnh báo đã gửi" },
  { id: "contacts", label: "Điểm liên lạc" },
  { id: "rules", label: "Quy tắc cảnh báo" },
  { id: "policy", label: "Chính sách thông báo" },
] as const;

type TabType = typeof TABS[number]["id"];

export default function AlertPage() {
  const [activeTab, setActiveTab] = useState<TabType>("sent");

  return (
    <div className="w-full px-4 md:px-6 pt-4">
      {/* ✅ Header lớn */}
      <div className="flex items-center mb-6">
        <div className="p-4">
          <Bell className="stroke-blue-400" size={40} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Cảnh báo</h1>
          <p className="text-gray-500">Những quy tắc cảnh báo và thông báo</p>
        </div>
      </div>

      {/* ✅ Tabs và nút nằm cùng hàng */}
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
      </div>

      {/* Nội dung các tab */}
      <div className="text-sm text-gray-700">
        {activeTab === "sent" && <SentAlerts />}
        {activeTab === "contacts" && <ContactPoints />}
        {activeTab === "rules" && <AlertRules />}
        {activeTab === "policy" && <NotificationPolicy />}
      </div>
    </div>
  );
}

// Placeholder content
function SentAlerts() {
  return <div className="p-2 text-gray-600">Danh sách các cảnh báo đã gửi.</div>;
}

function ContactPoints() {
  return <div className="p-2 text-gray-600">Thông tin điểm liên lạc sẽ hiển thị ở đây.</div>;
}

function AlertRules() {
  return <div className="p-2 text-gray-600">Danh sách quy tắc cảnh báo.</div>;
}

function NotificationPolicy() {
  return <div className="p-2 text-gray-600">Chính sách thông báo sẽ được hiển thị tại đây.</div>;
}
