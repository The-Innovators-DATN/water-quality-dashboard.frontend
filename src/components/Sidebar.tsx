"use client";

import Image from "next/image";
import { PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

import { useSidebarStore } from "@/lib/stores/useSidebarStore";
import { adminNavItems } from "@/lib/data/navItems";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, isPinned, setOpen, setPinned } = useSidebarStore();

  return (
    <>
      {isOpen && isPinned && (
        <div className="w-52 h-screen px-4 py-2 shadow border-r bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <button
                onClick={() => setOpen(!isOpen)}
                className="flex items-center"
              >
                <Image src="/aquatech.png" alt="logo" width={25} height={25} />
              </button>
              <p className="font-medium ">Aquatech</p>
            </div>
            <button
              onClick={() => {setPinned(!isPinned); setOpen(!isOpen)}}
            >
              <PanelLeft size={20} />
            </button>
          </div>

          <nav className="mt-6 flex flex-col gap-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={clsx(
                    "flex items-center gap-x-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors",
                    pathname === item.path && "bg-gray-100 font-semibold"
                  )}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
