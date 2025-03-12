"use client";

import { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";
import { ProfileMenuSection } from "@/lib/types/sidebar";

interface UserProfileDropdownProps {
  profileMenuSections: ProfileMenuSection[];
  userName: string;
  userRole: string;
}

export default function UserProfileDropdown({ 
  profileMenuSections, 
  userName, 
  userRole 
}: UserProfileDropdownProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Xử lý click bên ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) && 
        isMenuOpen
      ) {
        setIsMenuOpen(false);
      }
    }
    
    // Thêm event listener khi dropdown đang mở
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Cleanup function
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="mt-auto pt-4 border-t border-blue-700 relative" ref={menuRef}>
      <div 
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-blue-800 rounded-md transition-colors"
        onClick={toggleMenu}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-500 p-1">
            <User size={24} />
          </div>
          <div>
            <p className="font-medium">{userName}</p>
            <p className="text-xs text-blue-300">{userRole}</p>
          </div>
        </div>
      </div>
      
      {/* Profile Dropdown Menu - shadcn/ui style */}
      {isMenuOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white text-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
          {profileMenuSections.map((section, index) => (
            <div key={index}>
              {section.title && (
                <div className="py-1 px-2 text-sm font-medium text-gray-500">
                  {section.title}
                </div>
              )}
              
              <div className="py-1">
                {section.items.map((item) => (
                  <a 
                    key={item.id} 
                    href={item.path} 
                    className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon size={16} className="text-gray-500" />
                      <span>{item.title}</span>
                    </div>
                    {item.shortcut && <span className="text-xs text-gray-500">{item.shortcut}</span>}
                  </a>
                ))}
              </div>
              
              {section.hasDivider && <div className="border-t border-gray-200"></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}