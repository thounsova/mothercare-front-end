"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const baseURL = "http://localhost:1337";

// ✅ Same helper as BlogPost
const getImageUrl = (imageData?: any) => {
  if (!imageData) return "";
  const relativeUrl =
    imageData.formats?.small?.url ||
    imageData.formats?.thumbnail?.url ||
    imageData.url ||
    "";
  if (!relativeUrl) return "";
  return relativeUrl.startsWith("http") ? relativeUrl : baseURL + relativeUrl;
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
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    async function fetchResidents() {
      try {
        const res = await fetch(
          "http://localhost:1337/api/profile-residents?populate=avatar"
        );
        if (!res.ok) throw new Error("Failed to fetch residents");
        const data = await res.json();

        const formattedResidents: Resident[] = data.data.map(
          (item: any, index: number) => {
            const avatarImage = item.avatar?.[0]; // ✅ take first image if exists
            return {
              id: item.id,
              name: item.name,
              gender: item.gender,
              nick_name: item.nick_name,
              date_of_birth: item.date_of_birth,
              classLevel: index % 2 === 0 ? "Class A" : "Class B", // temporary
              avatar: getImageUrl(avatarImage),
            };
          }
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
  }, []);

  // ✅ Filter by class and search
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
          {filteredResidents.map((resident) => {
            const avatarUrl: string = resident.avatar || "/default-avatar.png";

            return (
              <div
                key={resident.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between bg-blue-600 text-white p-4 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={avatarUrl}
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
                    <p className="text-sm font-semibold">{resident.gender}</p>
                    <p className="text-sm font-semibold">
                      {resident.classLevel}
                    </p>
                  </div>
                </div>
              <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#ddeafff1] text-black text-[15px]">
                👁️ VIEW
              </button>
            </div>
          ))}
        </div>

           
          })}
        </div>
      </div>
    </div>
  );
}
