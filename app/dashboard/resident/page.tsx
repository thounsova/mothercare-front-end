"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Eye } from "lucide-react";

const baseURL = "http://localhost:1337";

// Helper to get avatar URL
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

// Resident type
interface Resident {
  id: number;
  documentId: string;
  locale: string;
  name: string;
  nick_name?: string;
  gender?: string;
  country: string;
  date_of_birth?: string;
  number?: string;
  avatar?: any[];
  class?: {
    id: number;
    name: string;
  };
}

export default function ResidentList() {
  const router = useRouter();
  const params = useParams();
  const [locale, setLocale] = useState<"en" | "km">(
    (params.locale as "en" | "km") || "en"
  );
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch residents from Strapi
  const fetchResidents = async (locale: "en" | "km") => {
    try {
      console.log("Fetch Residents....")
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const url = `${baseURL}/api/profile-residents?populate=avatar&populate=class&locale=${locale}`;

      const res = await fetch(
        url,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log()

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      const data = await res.json();
      console.log("data:", data)

      const allResidents: Resident[] = data.data.map((r: any) => ({
        id: r.id,
        documentId: r.documentId,
        locale: r.locale,
        name: r.name,
        nick_name: r.nick_name,
        gender: r.gender,
        date_of_birth: r.date_of_birth,
        number: r.number,
        avatar: r.avatar,
        class: r.class,
        country: r.country,
      }));

      setResidents(allResidents);
      setFilteredResidents(allResidents);
    } catch (err) {
      console.error("Failed to fetch residents:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount or when locale changes
  useEffect(() => {
    setLoading(true);
    fetchResidents(locale);
  }, [locale]);

  // Filter residents by class and search term
  useEffect(() => {
    let filtered = residents;

    if (selectedClass !== "All") {
      filtered = filtered.filter((r) => r.class?.name === selectedClass);
    }

    if (searchTerm) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredResidents(filtered);
  }, [residents, selectedClass, searchTerm]);

  if (loading) return <p className="p-6 text-center">Loading residents...</p>;

  // Unique class names for dropdown
  const classOptions = Array.from(
    new Set(residents.map((r) => r.class?.name).filter(Boolean))
  );

  // Toggle language
  const toggleLocale = () => {
    const newLocale = locale === "en" ? "km" : "en";
    setLocale(newLocale);
  };

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="w-full max-w-5xl p-4 md:p-6 mx-auto">
        {/* Top Bar: Search + Class + Language */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <input
            type="text"
            placeholder={locale === "en" ? "Search here..." : "ស្វែងរក..."}
            className="border px-4 py-2 w-full sm:w-64 rounded-lg shadow-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex items-center gap-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border px-4 py-2 w-full sm:w-48 rounded-lg border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            >
              <option value="All">
                {locale === "en" ? "All Classes" : "គ្រប់ថ្នាក់"}
              </option>
              {classOptions.map((cls, idx) => (
                <option key={idx} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            <button
  onClick={toggleLocale}
  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-300 font-medium text-sm sm:text-base"
>
  {locale === "en" ? "🇰🇭 Khmer" : "🇬🇧 English"}
</button>
          </div>
        </div>
        {/* Resident Cards */}
        <div className="space-y-4">
          {filteredResidents.map((resident) => (
            <div
              key={resident.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-blue-600 text-white shadow-md p-4 rounded-lg hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                <Image
                  src={getAvatarUrl(resident.avatar)}
                  alt={resident.name}
                  width={70}
                  height={70}
                  className="rounded-full object-cover"
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <p className="font-semibold text-lg sm:text-xl">{resident.name}</p>
                  {resident.nick_name && (
                    <p className="text-gray-200 text-sm sm:text-base italic">
                      ({resident.nick_name})
                    </p>
                  )}
                  {resident.country && (
                    <p className="text-gray-200 text-sm sm:text-base italic">
                      ({resident.country})
                    </p>
                  )}
                  <p className="text-gray-400 text-sm sm:text-base italic">
                    {resident.class?.name || (locale === "en" ? "No Class" : "គ្មានថ្នាក់")}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  router.push(`/dashboard/${locale}/profile/${resident.documentId}`)
                }
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-800 text-sm sm:text-base hover:bg-blue-200 transition"
              >
                <Eye size={18} />
                {locale === "en" ? "VIEW" : "មើល"}
              </button>
            </div>
          ))}

          {filteredResidents.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              {locale === "en" ? "No residents found." : "មិនមានទិន្នន័យសិស្ស។"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
