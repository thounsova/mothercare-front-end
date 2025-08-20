"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Role } from "@/app/lib/sidebarMenus";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const hideLayout = pathname === "/login";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token && !hideLayout) {
      router.push("/login");
    } else if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        // ✅ Strapi gives role object → extract `type`
        const userRole = user.role?.type as Role | null;
        setRole(userRole ?? null);
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setRole(null);
        router.push("/login");
      }
    }
  }, [pathname, router, hideLayout]);

  if (hideLayout) return <>{children}</>;
  if (!role)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-gray-500 animate-pulse">Loading...</span>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        } ml-0`}
      >
        <header
          className={`fixed top-0 right-0 z-10 h-16 bg-white shadow flex items-center transition-all duration-300 w-full md:w-auto ${
            collapsed ? "md:left-20" : "md:left-64"
          } md:right-0`}
        >
          <Navbar />
        </header>

        <main className="flex-1 pt-16 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
