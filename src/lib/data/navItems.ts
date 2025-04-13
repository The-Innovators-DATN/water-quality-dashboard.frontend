import {
    House,
    Droplet,
    Bell,
    BarChart,
    Users,
    Settings,
} from "lucide-react";
  
export const adminNavItems = [
    { id: "home", title: "Trang chủ", icon: House, path: "/" },
    { id: "water", title: "Quan trắc nước", icon: Droplet, path: "/dashboard" },
    { id: "alerts", title: "Cảnh báo", icon: Bell, path: "/alerts" },
    { id: "reports", title: "Báo cáo", icon: BarChart, path: "/reports" },
    { id: "accounts", title: "Tài khoản", icon: Users, path: "/accounts" },
];
  
export const userNavItems = [
    { id: "home", title: "Tổng quan", icon: House, path: "/" },
    { id: "my-water", title: "Dữ liệu của tôi", icon: Droplet, path: "/my/water" },
    { id: "alerts", title: "Cảnh báo", icon: Bell, path: "/alerts" },
    { id: "settings", title: "Cài đặt", icon: Settings, path: "/settings" },
];
  