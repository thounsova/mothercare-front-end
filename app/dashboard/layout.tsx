"use client";

import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 w-full text-center bg-gray-700 hover:bg-gray-600"
        >
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
