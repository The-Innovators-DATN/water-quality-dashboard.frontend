"use client";

import { useEffect, useState } from "react";
import SidebarHeader from "@/components/sidebar/SidebarHeader";
import NavigationMenu from "@/components/sidebar/NavigationMenu";
import UserProfileDropdown from "@/components/sidebar/UserProfileDropdown";
import { navItems, profileMenuSections } from "@/lib/data/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export default function Sidebar() {
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  
  const { user } = useAuthStore(state => ({
    user: state.user
  }));

  useEffect(() => {
    setIsClient(true);
    if (user) {
      setUserName(user.fullName || "");
      
      let roleText = "Người dùng";
      if (user.role === "admin") {
        roleText = "Quản trị viên";
      } else if (user.role === "technician") {
        roleText = "Kỹ thuật viên";
      }
      
      setUserRole(roleText);
    }
  }, [user]);

  return (
    <div className="h-screen w-auto p-4 space-y-2 bg-[#132d65] text-white flex flex-col">
      <SidebarHeader />
      <NavigationMenu items={navItems} />
      {isClient && (
        <UserProfileDropdown 
          profileMenuSections={profileMenuSections} 
          userName={userName} 
          userRole={userRole}
        />
      )}
    </div>
  );
}