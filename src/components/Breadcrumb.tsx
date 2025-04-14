'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { adminNavItems } from '@/lib/data/navItems';

export default function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const navMatch = adminNavItems.find((item) => item.path === path);

    return {
      label: navMatch?.title || decodeURIComponent(segment),
      href: path,
      isLast: index === segments.length - 1,
    };
  });

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      <Link href="/" className="hover:underline text-blue-600 font-medium">Trang chủ</Link>
      {breadcrumbs.map((item, idx) => (
        <span key={idx} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          {item.isLast ? (
            <span className="text-gray-500">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:underline text-blue-600 font-medium">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
