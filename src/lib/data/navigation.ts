import { 
    ChartNoAxesColumnIncreasing, 
    Server, 
    TriangleAlert, 
    ClipboardList, 
    User,
    UserCircle,
    Settings,
    LogOut 
  } from "lucide-react";
  import { NavItem, ProfileMenuSection } from "@/lib/types/sidebar";
  
  export const navItems: NavItem[] = [
    { 
      id: "dashboard", 
      title: "Dashboard", 
      icon: ChartNoAxesColumnIncreasing, 
      path: "/dashboard",
      hasSubmenu: true,
      submenu: [
        { id: "dashboard-water", title: "Dashboard quan trắc nước", path: "/dashboard/water", icon: null },
        { id: "dashboard-admin", title: "Dashboard quản trị viên", path: "/dashboard/admin", icon: null }
      ]
    },
    { id: "data", title: "Dữ liệu", icon: Server, path: "/data" },
    { id: "alert", title: "Cảnh báo", icon: TriangleAlert, path: "/alert" },
    { id: "report", title: "Báo cáo", icon: ClipboardList, path: "/report" },
    { id: "account", title: "Tài khoản", icon: User, path: "/account" },
  ];
  
  export const profileMenuSections: ProfileMenuSection[] = [
    {
      title: "Tài khoản của tôi",
      items: [
        { id: "profile", title: "Thông tin cá nhân", icon: UserCircle, path: "/profile", shortcut: "⌘P" },
        { id: "billing", title: "Thanh toán", icon: ClipboardList, path: "/billing", shortcut: "⌘B" },
        { id: "settings", title: "Cài đặt", icon: Settings, path: "/settings", shortcut: "⌘S" },
      ],
      hasDivider: true
    },
    {
      items: [
        { id: "logout", title: "Đăng xuất", icon: LogOut, path: "/logout", shortcut: "⌘Q" },
      ]
    }
];