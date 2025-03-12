"use client";

import { useState } from "react";
import SidebarItem from "./SidebarItem";
import { NavItem } from "@/lib/types/sidebar";

interface NavigationMenuProps {
  items: NavItem[];
}

export default function NavigationMenu({ items }: NavigationMenuProps) {
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>("dashboard");
  
  const toggleSubmenu = (id: string) => {
    setExpandedMenuId(expandedMenuId === id ? null : id);
  };

  return (
    <div className="space-y-2 overflow-y-auto flex-grow">
      {items.map((item) => (
        <div key={item.id}>
          <SidebarItem 
            {...item} 
            isExpanded={expandedMenuId === item.id}
            toggleSubmenu={() => toggleSubmenu(item.id)}
          />
          
          {/* Submenu */}
          {item.hasSubmenu && expandedMenuId === item.id && item.submenu && (
            <div className="pl-8 space-y-1 mt-1">
              {item.submenu.map((subItem) => (
                <SidebarItem 
                  key={subItem.id}
                  {...subItem}
                  isSubmenuItem={true}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}