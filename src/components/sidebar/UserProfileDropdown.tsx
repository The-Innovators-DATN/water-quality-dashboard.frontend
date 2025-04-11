"use client";

import { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";
import { ProfileMenuSection, ProfileMenuItem } from "@/lib/types/sidebar";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/stores/useAuthStore";

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
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
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

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Xử lý click menu item
  const handleMenuItemClick = async (item: ProfileMenuItem, event: React.MouseEvent) => {
    event.preventDefault();
    
    // Nếu là logout, xử lý đặc biệt
    if (item.id === 'logout') {
      setLoadingItem('logout');
      
      try {
        // Sử dụng hàm logout trực tiếp thay vì từ store
        logout();
        
        // Thêm chút delay để trải nghiệm tốt hơn
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Đóng menu và chuyển hướng
        setIsMenuOpen(false);
        router.push('/login');
      } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
      } finally {
        setLoadingItem(null);
      }
    } else {
      setIsMenuOpen(false);
      router.push(item.path);
    }
  };

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
            <p className="font-medium text-clip">{userName}</p>
            <p className="text-xs text-blue-300">{userRole}</p>
          </div>
        </div>
      </div>

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
                    onClick={(e) => handleMenuItemClick(item, e)}
                  >
                    <div className="flex items-center gap-2">
                      {loadingItem === item.id ? (
                        <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <item.icon size={16} className="text-gray-500" />
                      )}
                      <span>{loadingItem === item.id && item.id === 'logout' ? 'Đang đăng xuất...' : item.title}</span>
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