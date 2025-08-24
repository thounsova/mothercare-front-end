// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard"); // Redirect root to dashboard
  }, [router]);

  return <p className="p-6 text-center">Redirecting to Dashboard...</p>;
}
