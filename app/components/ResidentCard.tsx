"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/app/lib/api";
import { ResidentProgram } from "@/app/types";

export default function ResidentList({ programId }: { programId: string }) {
  const [residents, setResidents] = useState<ResidentProgram[]>([]);

  useEffect(() => {
    apiFetch(`/api/resident-programs?filters[program][id][$eq]=${programId}`)
      .then((res) => setResidents(res.data || []));
  }, [programId]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Assigned Residents</h2>
      <ul className="space-y-3">
        {residents.map((rp) => (
          <li
            key={rp.id}
            className="p-4 border rounded-xl shadow-sm bg-white hover:shadow-md transition"
          >
            <Link href={`/resident-skills/${rp.id}`} className="flex items-center gap-3">
              {rp.resident.avatar && (
                <img
                  src={rp.resident.avatar}
                  alt={rp.resident.full_name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <span>{rp.resident.full_name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
