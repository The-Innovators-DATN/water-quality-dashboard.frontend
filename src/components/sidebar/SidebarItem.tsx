"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SidebarItemProps {
  id: string;
  title: string;
  icon: any;
  path: string;
  hasSubmenu?: boolean;
  isExpanded?: boolean;
  toggleSubmenu?: () => void;
  isSubmenuItem?: boolean;
  submenu?: Array<{
    id: string;
    title: string;
    path: string;
  }>;
}

const SidebarItem = ({ 
  id, 
  title, 
  icon: Icon, 
  path, 
  hasSubmenu = false,
  isExpanded = false,
  toggleSubmenu,
  isSubmenuItem = false,
  submenu 
}: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === path || 
                  (submenu?.some(item => pathname === item.path) && isExpanded);
  
  // Nếu là item con trong submenu thì check active riêng
  const isSubmenuActive = isSubmenuItem && pathname === path;

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubmenu && toggleSubmenu) {
      e.preventDefault();
      toggleSubmenu();
    }
  };

  return (
    <Link href={path} onClick={handleClick}>
      <div
        className={`p-3 flex gap-2 items-center rounded-md cursor-pointer transition-all
            ${isSubmenuItem 
              ? isSubmenuActive 
                ? "bg-blue-600 text-white" 
                : "hover:bg-blue-600 hover:text-white"
              : isActive 
                ? "bg-blue-500 text-white" 
                : "hover:bg-blue-600 hover:text-white"
            }
        `}
      >
        {Icon && <Icon size={24} />}
        <p className={`${isSubmenuItem ? "text-sm" : "text-md"} flex-grow`}>{title}</p>
        {hasSubmenu && (
          isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
        )}
      </div>
    </Link>
  );
};

export default SidebarItem;