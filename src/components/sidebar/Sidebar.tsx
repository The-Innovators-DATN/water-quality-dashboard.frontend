"use client";

import SidebarHeader from "@/components/sidebar/SidebarHeader";
import NavigationMenu from "@/components/sidebar/NavigationMenu";
import UserProfileDropdown from "@/components/sidebar/UserProfileDropdown";
import { navItems, profileMenuSections } from "@/lib/data/navigation";

export default function Sidebar() {
  return (
    <div className="h-screen w-auto p-4 space-y-2 bg-[#132d65] text-white flex flex-col">
      <SidebarHeader />
      <NavigationMenu items={navItems} />
      <UserProfileDropdown 
        profileMenuSections={profileMenuSections}
        userName="Nguyễn Văn A"
        userRole="Quản trị viên"
      />
    </div>
  );
}