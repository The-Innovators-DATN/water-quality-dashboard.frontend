"use client";

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { ChevronDown, PanelLeft } from "lucide-react";
import { Dialog, DialogPanel, Transition, TransitionChild, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import Breadcrumb from "@/components/Breadcrumb";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useSidebarStore } from "@/lib/stores/useSidebarStore";
import { adminNavItems } from "@/lib/data/navItems";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { isOpen, isPinned, setOpen, setPinned } = useSidebarStore();

  const handleLogout = () => {
    try {
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

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

          <Breadcrumb />
        </div>

        <div className="flex items-center gap-3">
          <Menu>
            <MenuButton className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors">
              <Image src="/aquatech.png" alt="user" width={25} height={25} />
            </MenuButton>
            <MenuItems 
              anchor="bottom end"
              className="w-52 bg-white rounded-md border z-50">
              <MenuItem>
                <button 
                  className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10"
                  onClick={() => handleLogout()}
                >
                  Đăng xuất
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
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
                        const isActive =
                          item.path === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.path);

                        return (
                          <Link
                            key={item.id}
                            href={item.path}
                            className={clsx(
                              "flex items-center gap-x-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors",
                              isActive && "bg-gray-100 font-semibold"
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

