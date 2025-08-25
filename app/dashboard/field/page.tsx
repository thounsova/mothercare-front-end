"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const baseURL = "http://localhost:1337";

interface Program {
  id: number;
  name: string;
  description?: string;
  // add other fields from your API if needed
}

export default function ResidentPrograms() {
  const router = useRouter();
  const { residentId } = useParams();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    if (!residentId) {
      console.error("residentId is missing!");
      setPrograms([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${baseURL}/api/programs?filters[resident][documentId][$eq]=${residentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        console.error("Failed to fetch programs:", res.statusText);
        setPrograms([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      // data.data is expected to be an array of programs
      setPrograms(data.data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [residentId]);

  if (loading) return <p className="p-6 text-center">Loading programs...</p>;

  if (programs.length === 0)
    return <p className="p-6 text-center">No programs found for this resident.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-3">
      <h1 className="text-xl font-bold mb-4">Programs</h1>
      {programs.map((program) => (
        <div
          key={program.id}
          className="flex justify-between p-4 bg-gray-100 rounded-lg"
        >
          <p className="font-semibold">{program.name}</p>
          <button
            onClick={() =>
              router.push(
                `/dashboard/residents/${residentId}/programs/${program.id}`
              )
            }
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Evaluate
          </button>
        </div>
      ))}
    </div>
  );
}
