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
      
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
