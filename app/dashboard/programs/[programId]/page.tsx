"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface KidProfile {
  id: number;
  full_name: string;
  nick_name?: string;
  date_of_birth?: string;
}

interface ProgramSkill {
  id: number;
  name: string;
}

interface ResidentProgram {
  id: number;
  documentId: string;
  kid_profile: KidProfile;
  program_skills: ProgramSkill[];
}

export default function ProgramResidentsPage() {
  const { programId } = useParams(); // this is documentId from ProgramsPage
  const [residents, setResidents] = useState<ResidentProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!programId) return;

    fetch(
      `https://energized-fireworks-cc618580b1.strapiapp.com/api/resident-programs?filters[program][documentId][$eq]=${programId}&populate=*`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch residents");
        return res.json();
      })
      .then((data) => setResidents(data.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [programId]);

  if (loading) return <p className="p-6">Loading residents...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Residents</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {residents.map((r) => (
          <div
            key={r.id}
            className="p-4 bg-white rounded-xl shadow hover:shadow-lg flex flex-col gap-2"
          >
            <span className="font-medium">{r.kid_profile.full_name}</span>
            {r.kid_profile.nick_name && <span>Nickname: {r.kid_profile.nick_name}</span>}
            {r.kid_profile.date_of_birth && <span>DOB: {r.kid_profile.date_of_birth}</span>}
            {r.program_skills.length > 0 && (
              <p className="text-sm text-gray-500">
                Skills: {r.program_skills.map((s) => s.name).join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
