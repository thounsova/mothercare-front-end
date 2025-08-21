"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

const baseURL = "http://localhost:1337";

// Helper to get correct image URL from Strapi media field
const getAvatarUrl = (avatars?: any[]) => {
  if (!avatars || avatars.length === 0) return "/default-avatar.png";
  const avatar = avatars[0];
  const url =
    avatar.formats?.thumbnail?.url ||
    avatar.formats?.small?.url ||
    avatar.url ||
    "";
  return url.startsWith("http") ? url : baseURL + url;
};

interface Resident {
  id: number;
  documentId: string; // added
  name: string;
  gender?: string;
  nick_name?: string;
  date_of_birth?: string;
  classId?: number;
  classLevel?: string;
  avatar?: string;
}

interface ClassData {
  id: number;
  name: string;
}

export default function ResidentList() {
  const router = useRouter();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Helper to fetch data with token and handle 401/403
  const fetchWithToken = async (url: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      throw new Error("No token found");
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
      throw new Error(`Unauthorized or Forbidden: ${res.status}`);
    }

    if (!res.ok) throw new Error("Failed to fetch data");
    return res.json();
  };

  // Fetch classes and their residents
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchWithToken(
          "http://localhost:1337/api/classes?populate[profile_residents][populate]=avatar"
        );

        // Map classes
        const classList: ClassData[] = data.data.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
        }));
        setClasses(classList);

        // Flatten all residents with class info
        const allResidents: Resident[] = data.data.flatMap((cls: any) =>
          (cls.profile_residents || []).map((r: any) => ({
            id: r.id,
            documentId: r.documentId, // include documentId
            name: r.name,
            gender: r.gender,
            nick_name: r.nick_name,
            date_of_birth: r.date_of_birth,
            classId: cls.id,
            classLevel: cls.name,
            avatar: getAvatarUrl(r.avatar),
          }))
        );

        setResidents(allResidents);
        setFilteredResidents(allResidents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  // Filter residents by class and search term
  useEffect(() => {
    let filtered = residents;

    if (selectedClass !== "All") {
      filtered = filtered.filter((r) => r.classLevel === selectedClass);
    }

    if (searchTerm) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredResidents(filtered);
  }, [residents, selectedClass, searchTerm]);

  if (loading) return <p className="p-6 text-center">Loading residents...</p>;

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="w-full max-w-5xl p-4 md:p-6 mx-auto">
        {/* Filter and Search */}
        <div className="flex flex-col-12 sm:flex-row justify-between items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search here..."
            className="border px-3 py-2 w-full sm:w-64 rounded-lg shadow-2xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border px-3 py-2 w-full sm:w-48 rounded-lg border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            aria-label="Select Class"
          >
            <option value="All">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.name}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Residents */}
        <div className="space-y-4">
          {filteredResidents.map((resident) => (
            <div
              key={resident.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-blue-600 text-white shadow-md p-4 rounded-lg transition hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                <Image
                  src={resident.avatar || "/default-avatar.png"}
                  alt={resident.name}
                  width={70}
                  height={70}
                  className="rounded-full object-cover"
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <p className="font-semibold text-lg sm:text-xl">
                    {resident.name}
                  </p>
                  {resident.nick_name && (
                    <p className="text-gray-200 text-sm sm:text-base italic">
                      ({resident.nick_name})
                    </p>
                  )}
                  <p className="text-gray-400 text-sm sm:text-base italic">
                    {resident.classLevel || "No Class"}
                  </p>
                </div>
              </div>

              {/* VIEW Button */}
              <button
                onClick={() =>
                  router.push(`/dashboard/profile/${resident.documentId}`)
                }
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-800 text-sm sm:text-base hover:bg-blue-200 transition"
              >
                <Eye size={18} />
                VIEW
              </button>
            </div>
          ))}

          {filteredResidents.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              No residents found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
