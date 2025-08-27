"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/app/lib/api";
import { Program } from "@/app/types";

export default function ProgramList() {
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    apiFetch("/api/programs").then((res) => setPrograms(res.data || []));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Programs</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <Link
            key={program.id}
            href={`/resident-programs/${program.id}`}
            className="p-4 rounded-xl border shadow-sm hover:shadow-md transition bg-white"
          >
            <div className="flex items-center gap-2">
              {program.icon && (
                <img src={program.icon} alt={program.name} className="w-8 h-8" />
              )}
              <span className="font-medium">{program.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
