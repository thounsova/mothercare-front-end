"use client";

import { useState } from "react";
import Sidebar, { Role } from "@/app/components/Sidebar";

// Simulated auth function
const getCurrentUser = () => {
  return { role: "admin" }; // replace with real auth logic
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();

  // ✅ Assert role type
  const role: Role = (user?.role as Role) || "parent";

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        className={`flex-1 p-6 bg-gray-50 transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
