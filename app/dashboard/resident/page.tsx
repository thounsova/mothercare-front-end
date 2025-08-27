"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Eye } from "lucide-react";

const baseURL = "https://energized-fireworks-cc618580b1.strapiapp.com";

// -------------------- Helper --------------------
const getAvatarUrl = (avatar?: {
  url?: string;
  formats?: { thumbnail?: { url: string }; small?: { url: string } };
}): string => {
  if (!avatar) return "/default-avatar.png";
  const url =
    avatar.formats?.thumbnail?.url || avatar.formats?.small?.url || avatar.url || "";
  return url.startsWith("http") ? url : baseURL + url;
};

// -------------------- Types --------------------
interface ClassData {
  id: number;
  name: string;
}

interface Resident {
  id: number;
  documentId: string;
  locale: string;
  full_name: string;
  nick_name?: string;
  gender?: string;
  country: string;
  date_of_birth?: string;
  number?: string;
  avatar?: { url?: string; formats?: { thumbnail?: { url: string }; small?: { url: string } } };
  class?: ClassData;
  parent_users?: { id: number; username: string; email: string }[];
  educator_user?: { id: number; username: string; email: string } | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

// Raw Strapi response (without attributes nesting)
interface RawResident {
  id: number;
  documentId: string;
  locale: string;
  full_name: string;
  nick_name?: string;
  gender?: string;
  country: string;
  date_of_birth?: string;
  number?: string;
  avatar?: { url?: string; formats?: { thumbnail?: { url: string }; small?: { url: string } } };
  class?: { id: number; name: string };
  parent_users?: { id: number; username: string; email: string }[];
  educator_user?: { id: number; username: string; email: string } | null;
}

interface RawStrapiResponse<T> {
  data: T[];
  meta: { pagination: Pagination };
}

// -------------------- Component --------------------
export default function ResidentList() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as "en" | "km") || "en";

  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 4,
    pageCount: 1,
    total: 0,
  });

  // -------------------- Fetch residents --------------------
  const fetchResidents = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");

        if (!token || !loggedUser?.id) {
          router.push("/login");
          return;
        }

        const role = loggedUser.role?.type;
        const branchDocumentId = loggedUser.branch?.documentId;
        const userDocumentId = loggedUser.documentId;

        let url = `${baseURL}/api/profile-residents?populate=avatar&populate=class&populate=parent_users&populate=educator_user&pagination[page]=${page}&pagination[pageSize]=${pagination.pageSize}`;

        if (role === "educator") {
          url += `&filters[educator_user][documentId][$eq]=${userDocumentId}`;
        } else if (role === "parent") {
          url += `&filters[parent_users][documentId][$eq]=${userDocumentId}`;
        } else if (branchDocumentId) {
          url += `&filters[branch][documentId][$eq]=${branchDocumentId}`;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }

        const data: RawStrapiResponse<RawResident> = await res.json();

        setResidents(data.data);
        setFilteredResidents(data.data);

        if (data.meta?.pagination) setPagination(data.meta.pagination);
      } catch (err) {
        console.error("Failed to fetch residents:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageSize, router]
  );

  useEffect(() => {
    fetchResidents(pagination.page);
  }, [fetchResidents, pagination.page]);

  // -------------------- Filtering --------------------
  useEffect(() => {
    let filtered = residents;
    if (selectedClass !== "All") {
      filtered = filtered.filter((r) => r.class?.name === selectedClass);
    }
    if (searchTerm) {
      filtered = filtered.filter((r) =>
        r.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredResidents(filtered);
  }, [residents, selectedClass, searchTerm]);

  if (loading) return <p className="p-6 text-center">Loading residents...</p>;

  const classOptions = Array.from(
    new Set(
      residents
        .map((r) => r.class?.name)
        .filter((name): name is string => !!name)
    )
  );

  // -------------------- JSX --------------------
  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="w-full max-w-5xl p-4 md:p-6 mx-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <input
            type="text"
            placeholder={locale === "en" ? "Search here..." : "ស្វែងរក..."}
            className="border px-4 py-2 w-full sm:w-64 rounded-lg shadow-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

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
        </div>

        {/* Resident Cards */}
        <div className="space-y-4">
          {filteredResidents.map((resident) => (
            <div
              key={resident.id}
              className="flex flex-col sm:flex-row sm:items-center border-b-blue-400 border-2 sm:justify-between bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                <Image
                  src={getAvatarUrl(resident.avatar)}
                  alt={resident.full_name}
                  width={70}
                  height={70}
                  className="rounded-full border-2 border-blue-400"
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <p className="font-semibold text-lg text-gray-950 sm:text-xl">
                    {resident.full_name}
                  </p>
                  {resident.nick_name && (
                    <p className="text-gray-700 text-sm sm:text-base italic">
                      ({resident.nick_name})
                    </p>
                  )}
                  {resident.country && (
                    <p className="text-gray-400 text-sm sm:text-base italic">
                      ({resident.country})
                    </p>
                  )}
                  <p className="text-gray-400 text-sm sm:text-base italic">
                    {resident.class?.name ||
                      (locale === "en" ? "No Class" : "គ្មានថ្នាក់")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
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
            </div>
          ))}

          {filteredResidents.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              {locale === "en" ? "No residents found." : "មិនមានទិន្នន័យសិស្ស។"}
            </p>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            disabled={pagination.page === 1}
            onClick={() =>
              setPagination((p) => ({ ...p, page: p.page - 1 }))
            }
            className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            {locale === "en" ? "Previous" : "ថយក្រោយ"}
          </button>

          {Array.from({ length: pagination.pageCount }, (_, i) => i + 1).map(
            (pg) => (
              <button
                key={pg}
                onClick={() => setPagination((p) => ({ ...p, page: pg }))}
                className={`px-3 py-1 rounded-lg border ${
                  pg === pagination.page
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {pg}
              </button>
            )
          )}

          <button
            disabled={pagination.page === pagination.pageCount}
            onClick={() =>
              setPagination((p) => ({ ...p, page: p.page + 1 }))
            }
            className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            {locale === "en" ? "Next" : "បន្ទាប់"}
          </button>
        </div>
      </div>
    </div>
  );
}
