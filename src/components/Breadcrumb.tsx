'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { adminNavItems } from '@/lib/data/navItems';
import { useDetailStore } from '@/lib/stores/useDetailStore';
import { useDashboardStore } from "@/lib/stores/useDashboardStore";
import { useAlertStore } from '@/lib/stores/useAlertStore';

const navMap = Object.fromEntries(adminNavItems.map(item => [item.path, item.title]));

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const { type, name } = useDetailStore();
  const dashboardTitle = useDashboardStore((s) => s.title);
  const alert = useAlertStore((s) => s.alert);

  const getLabelFromType = (type: string, name: string) => {
    switch (type) {
      case 'station':
        return `Trạm ${name}`;
      case 'catchment':
        return `Lưu vực ${name}`;
      case 'country':
        return `Quốc gia ${name}`;
      default:
        return name;
    }
  };

  let breadcrumbs;
  if (segments[0] === 'alert' && segments[1] === 'rules' && segments.length === 3) {
    breadcrumbs = [
      { label: 'Cảnh báo', href: '/alert', isLast: false },
      { label: 'Quy tắc cảnh báo', href: '/alert/rules', isLast: false },
      { label: alert?.name || segments[2], href: pathname, isLast: true },
    ];
  } else {
    breadcrumbs = segments
      .map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;

        const isDynamicDetail = segments.length >= 3 && index === 2 && type && name;

        const isTypeSegment = ["station", "catchment", "country"].includes(segment);
        const isFollowedById = segments[index + 1] && !["station", "catchment", "country"].includes(segments[index + 1]);

        if (isTypeSegment && isFollowedById) return null;

        const label = segment === 'new' && isLast
          ? 'Tạo mới'
          : isLast && isDynamicDetail
            ? getLabelFromType(type, name)
            : isLast && pathname.includes("/dashboard/") && dashboardTitle
              ? dashboardTitle
              : navMap[path] || decodeURIComponent(segment);

        return {
          label,
          href: path,
          isLast,
        };
      })
      .filter(Boolean);
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      <Link href="/" className="hover:underline text-blue-600 font-medium">Trang chủ</Link>
      {breadcrumbs.map((item, idx) => (
        <span key={idx} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          {item?.isLast ? (
            <span className="text-gray-500">{item.label}</span>
          ) : (
            <Link href={item?.href || '#'} className="hover:underline text-blue-600 font-medium">
              {item?.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
