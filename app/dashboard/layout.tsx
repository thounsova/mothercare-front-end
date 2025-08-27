"use client";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen">
    

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
