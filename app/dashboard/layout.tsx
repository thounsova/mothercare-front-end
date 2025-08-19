"use client";

import { useState } from "react";

// Simulated auth function
const getCurrentUser = () => {
  return { role: "admin" }; // replace with real auth logic
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();

  // ✅ Assert role type

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
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
