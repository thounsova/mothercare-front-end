"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarMenus } from "@/app/lib/sidebarMenus";
import {
  Home,
  Users,
  FileText,
  Stethoscope,
  LogOut,
  Baby,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export type Role = "admin" | "educator" | "parent";

interface SidebarProps {
  role: Role;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const iconMap: Record<string, any> = {
  Dashboard: Home,
  Resident: Users,
  Assessment: FileText,
  Reporting: FileText,
  Medical: Stethoscope,
  Kids: Baby,
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
      {/* Mobile toggle */}
 


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
            <div className="flex items-center gap-3 p-5 border-b border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Home className="text-blue-600" size={24} />
              </div>
              {!collapsed && (
                <div>
                  <h1 className="text-lg font-bold text-blue-900">Mother Care</h1>
                  <p className="text-sm text-gray-500">
                    {role.toUpperCase()} Panel
                  </p>
                </div>
              )}
            </div>

            {/* Menu */}
            <nav className="mt-6 flex flex-col gap-2 px-2">
              {menus.map((item) => {
                const Icon = iconMap[item.name] || FileText;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition 
                      ${
                        isActive
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
