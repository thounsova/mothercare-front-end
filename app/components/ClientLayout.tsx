"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const role: "admin" | "educator" | "parent" = "admin";
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar role={role} collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Section */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300
          ${collapsed ? "md:ml-20" : "md:ml-64"} ml-0`}
      >
        {/* Navbar */}
        <header
          className={`fixed top-0 right-0 z-10 h-16 bg-white shadow flex items-center transition-all duration-300
            w-full md:w-auto
            ${collapsed ? "md:left-20" : "md:left-64"} md:right-0`}
        >
          <Navbar />
        </header>

        {/* Main content */}
        <main className="flex-1 pt-16 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}