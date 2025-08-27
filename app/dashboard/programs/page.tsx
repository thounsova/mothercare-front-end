"use client";

import { useEffect, useState } from "react";
import { Activity, X } from "lucide-react";

interface Program {
  id: number;
  documentId: string;
  activity_name: string;
  description?: string | null;
  icon?: string;
  color?: string;
}

interface KidProfile {
  id: number;
  full_name: string;
  nick_name?: string;
  date_of_birth?: string;
  mother_name?: string;
  father_name?: string;
  number?: string;
  gender?: string;
  avatar?: { url: string };
}

interface ResidentProgram {
  id: number;
  kid_profile: KidProfile;
  program_skills: { id: number; name: string }[];
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [residents, setResidents] = useState<ResidentProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalData, setModalData] = useState<ResidentProgram[] | null>(null);

  const baseURL = "https://energized-fireworks-cc618580b1.strapiapp.com";

  // Fetch programs
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${baseURL}/api/programs`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch programs");
        return res.json();
      })
      .then((data) => setPrograms(data.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Fetch residents when clicking button
  const fetchResidents = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${baseURL}/api/profile-residents?populate=avatar&populate=class&populate=parent_users&populate=educator_user`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch residents");

      const data = await res.json();
      console.log("Residents API Response:", data);

      setResidents(data.data || []);
      setModalData(data.data || []);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p className="p-6 text-gray-600">Loading programs...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  const colors = [
    "bg-blue-50 border-blue-200 text-blue-700",
    "bg-green-50 border-green-200 text-green-700",
    "bg-yellow-50 border-yellow-200 text-yellow-700",
    "bg-red-50 border-red-200 text-red-700",
    "bg-purple-50 border-purple-200 text-purple-700",
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold">Programs</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {programs.map((program, index) => {
          const colorClass = program.color || colors[index % colors.length];

          return (
            <div
              key={program.id}
              className={`p-5 sm:p-6 rounded-2xl border shadow-sm hover:shadow-md transition flex flex-col gap-3 items-start ${colorClass}`}
            >
              <div className="flex items-center gap-3">
                {program.icon ? (
                  <img
                    src={program.icon}
                    alt={program.activity_name}
                    className="w-6 h-6 sm:w-7 sm:h-7"
                  />
                ) : (
                  <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-current" />
                )}
                <span className="text-base sm:text-lg font-semibold">
                  {program.activity_name}
                </span>
              </div>
              {program.description && (
                <p className="text-sm sm:text-base">{program.description}</p>
              )}

              <button
                onClick={fetchResidents}
                className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Show Residents
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 relative shadow-lg">
            <button
              className="absolute top-4 right-4 p-1 hover:bg-gray-200 rounded-full"
              onClick={() => setModalData(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Residents</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {modalData.length === 0 && <p>No residents found.</p>}
              {modalData.map((res: any) => (
                <div key={res.id} className="border rounded p-3 bg-gray-50">
                  <p>
                    <strong>Full Name:</strong> {res.full_name || res.kid_profile?.full_name}
                  </p>
                  <p>
                    <strong>Nick Name:</strong> {res.nick_name || res.kid_profile?.nick_name || "-"}
                  </p>
                  <p>
                    <strong>Gender:</strong> {res.gender || res.kid_profile?.gender || "-"}
                  </p>
                  <p>
                    <strong>Skills:</strong>{" "}
                    {res.program_skills?.map((s: any) => s.name).join(", ") || "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
