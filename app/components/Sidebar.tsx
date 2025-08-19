"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { sidebarMenus } from "@/app/lib/sidebarMenus";
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

export type Role = "admin" | "educator" | "parent";

interface SidebarProps {
  role: Role;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const iconMap: Record<string, any> = {
  Dashboard: Grid,
  Resident: UserCheck,
  Assessment: Clipboard,
  Reporting: BarChart,
  Medical: Heart,
  Kids: Users,
};

export default function Sidebar({ role, collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const menus = sidebarMenus[role];
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile open button */}
      {!openMobile && (
        <button
          className="fixed top-16 left-6 z-30 md:hidden bg-white p-2 rounded-b-md shadow"
          onClick={() => setOpenMobile(true)}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r shadow-lg transform transition-all duration-300 z-20
          ${openMobile ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
          ${collapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex flex-col justify-between h-full">
          {/* Top */}
          <div>
            {/* Logo / Profile */}
            <div className="flex items-center gap-3 p-5 border-b border-gray-200">
              <div className="w-10 h-10 relative rounded-full overflow-hidden">
                <Image
                  src="data:image/jpeg;base64,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"
                  alt="Profile"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              {!collapsed && (
                <div>
                  <h1 className="text-lg font-bold text-blue-900">Mother Care</h1>
                  <p className="text-sm text-gray-500">{role.toUpperCase()} Panel</p>
                </div>
              )}
            </div>

            {/* Menu */}
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
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom */}
          <div className="p-4 border-t border-gray-200">
            <button className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-600 transition">
              <LogOut size={20} />
              {!collapsed && "Log Out"}
            </button>
          </div>
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-10 bg-white border rounded-full shadow p-1"
        >
          {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>

        {/* Mobile close button */}
        {openMobile && (
          <button
            onClick={() => setOpenMobile(false)}
            className="absolute top-4 right-4 md:hidden p-2 bg-white rounded shadow"
          >
            <X size={24} />
          </button>
        )}
      </aside>

      {/* Mobile overlay */}
      {openMobile && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-10 md:hidden"
          onClick={() => setOpenMobile(false)}
        />
      )}
    </>
  );
}
