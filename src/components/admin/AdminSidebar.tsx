"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Factory,
  Newspaper,
  MessageSquareText,
  Mail,
  Settings,
  LogOut,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/san-pham", label: "Sản phẩm", icon: Package },
  { href: "/admin/danh-muc", label: "Danh mục", icon: FolderTree },
  { href: "/admin/linh-vuc", label: "Lĩnh vực hoạt động", icon: Factory },
  { href: "/admin/bai-viet", label: "Bài viết", icon: Newspaper },
  { href: "/admin/yeu-cau-bao-gia", label: "Yêu cầu báo giá", icon: MessageSquareText },
  { href: "/admin/lien-he", label: "Liên hệ", icon: Mail },
  { href: "/admin/cai-dat", label: "Cài đặt", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-900 text-sm font-bold text-white">
          PT
        </span>
        <span className="text-sm font-bold text-slate-900">Trang quản trị</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={logout} className="border-t border-slate-200 p-3">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </form>
    </aside>
  );
}
