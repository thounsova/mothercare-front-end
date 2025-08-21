"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const baseURL = "http://localhost:1337";

// Helper to get correct image URL from Strapi media field
const getAvatarUrl = (avatars?: any[]) => {
  if (!avatars || avatars.length === 0) return "/default-avatar.png";
  const avatar = avatars[0]; // pick first image
  const url =
    avatar.formats?.thumbnail?.url ||
    avatar.formats?.small?.url ||
    avatar.url ||
    "";
  return url.startsWith("http") ? url : baseURL + url;
};

interface Resident {
  id: number;
  name: string;
  gender?: string;
  nick_name?: string;
  date_of_birth?: string;
  classLevel?: string;
  avatar?: string;
}

export default function ResidentList() {
  const router = useRouter();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    async function fetchResidents() {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token found. Redirecting to login...");
        setLoading(false);
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(
          "http://localhost:1337/api/profile-residents?populate=avatar",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 401) {
          console.warn("Token invalid or expired. Redirecting to login...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch residents");

        const data = await res.json();

        const formattedResidents: Resident[] = data.data.map(
          (item: any, index: number) => ({
            id: item.id,
            name: item.name,
            gender: item.gender,
            nick_name: item.nick_name,
            date_of_birth: item.date_of_birth,
            classLevel: index % 2 === 0 ? "Class A" : "Class B", // temporary
            avatar: getAvatarUrl(item.avatar),
          })
        );

        setResidents(formattedResidents);
        setFilteredResidents(formattedResidents);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchResidents();
  }, [router]);

  // Filter by class and search term
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
    <div className="min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl p-6 mx-auto">
        {/* Filter and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search here..."
            className="border px-4 py-2 rounded w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="All">All Classes</option>
            <option value="Class A">Class A</option>
            <option value="Class B">Class B</option>
          </select>
        </div>

        {/* Residents */}
        <div className="space-y-3">
          {filteredResidents.map((resident) => (
            <div
              key={resident.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between bg-blue-600 text-white p-4 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={resident.avatar || "/default-avatar.png"}
                  alt={resident.name}
                  width={50}
                  height={50}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-[23px]">{resident.name}</p>
                  <p className="text-sm font-semibold">
                    {resident.date_of_birth ?? "N/A"}
                  </p>
                  <p className="text-sm font-semibold">
                    {resident.gender ?? "N/A"}
                  </p>
                  <p className="text-sm font-semibold">{resident.classLevel}</p>
                </div>
              </div>

              <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#ddeafff1] text-black text-[15px]">
                👁️ VIEW
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
