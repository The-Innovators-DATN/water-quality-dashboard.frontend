"use client";

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { ChevronDown, PanelLeft } from "lucide-react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";

import { useSidebarStore } from "@/lib/stores/useSidebarStore";
import { adminNavItems } from "@/lib/data/navItems";

export default function Header() {
  const pathname = usePathname();
  const { isOpen, isPinned, setOpen, setPinned } = useSidebarStore();

  return (
    <>
      <div className="h-10 px-4 py-2 flex items-center justify-between shadow border-b bg-white z-30">
        <div className="flex items-center gap-4">
          {!isOpen && (
            <button
              onClick={() => setOpen(!isOpen)}
              className="flex items-center"
            >
              <Image src="/aquatech.png" alt="logo" width={25} height={25} />
              {!isOpen && (
                <ChevronDown size={15} />
              )}
            </button>
          )}

          <nav className="text-sm text-gray-600">
            <ol className="flex space-x-2">
              <li className="font-medium text-gray-900">Quan trắc nước</li>
            </ol>
          </nav>
        </div>

        <div className="flex items-center gap-3">

        </div>
      </div>

      {isOpen && !isPinned && (
        <Transition show={isOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40"
            onClose={() => setOpen(!isOpen)}
          >
            <TransitionChild
              as={Fragment}
              enter="transition-opacity duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
            >
              <div className="fixed inset-0 bg-black/30" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <TransitionChild
                  as={Fragment}
                  enter="transition ease-in-out duration-300 transform"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                >
                  <DialogPanel className="w-52 h-screen absolute left-0 top-0 bg-white shadow-xl px-4 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-x-2">
                        <button
                          onClick={() => setOpen(!isOpen)}
                          className="flex items-center"
                        >
                          <Image src="/aquatech.png" alt="logo" width={25} height={25} />
                        </button>
                        <p className="font-medium">Aquatech</p>
                      </div>
                      <button
                        onClick={() => setPinned(!isPinned)}
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
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </>
  );
}
