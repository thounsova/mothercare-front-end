"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { sidebarMenus, Role } from "@/app/lib/sidebarMenus";
import {
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  Grid,
  UserCheck,
  Clipboard,
  BarChart,
  Heart,
  Users,
} from "lucide-react";

interface SidebarProps {
  role: Role;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ role, collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [openMobile, setOpenMobile] = useState(false);

  const iconMap: Record<string, any> = {
    Dashboard: Grid,
    Resident: UserCheck,
    Assessment: Clipboard,
    Reporting: BarChart,
    Medical: Heart,
    Kids: Users,
  };

  const menus = sidebarMenus[role] ?? [];

  useEffect(() => setOpenMobile(false), [pathname]);

  return (
    <>
      {!openMobile && (
        <button
          className="fixed top-16 left-6 z-30 md:hidden bg-white p-2 rounded-b-md shadow"
          onClick={() => setOpenMobile(true)}
        >
          <Menu size={20} />
        </button>
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r shadow-lg transform transition-all duration-300 z-20
          ${openMobile ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
          ${collapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-3 p-5 border-b border-gray-200">
              <div className="w-10 h-10 relative rounded-full overflow-hidden">
                <Image
                  src="/profile.png"
                  alt="Profile"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>

            <nav className="mt-8 flex flex-col gap-3 px-2">
              {menus.map((item) => {
                const Icon = iconMap[item.name] || Users;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
                      ${isActive
                        ? "bg-blue-100 text-blue-900 font-semibold"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-900"
                      }`}
                  >
                    <Icon size={20} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-600 transition"
            >
              <LogOut size={20} />
              {!collapsed && "Log Out"}
            </button>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-10 bg-white border rounded-full shadow p-1"
        >
          {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>

        {openMobile && (
          <button
            onClick={() => setOpenMobile(false)}
            className="absolute top-4 right-4 md:hidden p-2 bg-white rounded shadow"
          >
            <X size={24} />
          </button>
        )}
      </aside>

      {openMobile && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-10 md:hidden"
          onClick={() => setOpenMobile(false)}
        />
      )}
    </>
  );
}
