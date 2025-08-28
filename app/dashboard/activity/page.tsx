"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

const baseURL = "https://energized-fireworks-cc618580b1.strapiapp.com";

interface ProgramSkill {
  id: number;
  documentId: string;
  name: string;
}

interface ProgramStatus {
  id: number;
  documentId: string;
  name: string;
  score: number;
}

interface ResidentField {
  id: number;
  documentId: string;
  activity_date: string;
  comments: string;
  validated_by: string;
  program_skill: ProgramSkill;
  program_status: ProgramStatus;
}

interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

interface RawStrapiResponse<T> {
  data: T[];
  meta: { pagination: Pagination };
}

export default function ResidentFieldsList() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as "en" | "km") || "en";

  const [fields, setFields] = useState<ResidentField[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    pageCount: 1,
    total: 0,
  });

  const [selectedDate, setSelectedDate] = useState<string>("2025-08-28");

  const fetchFields = useCallback(
    async (page = 1, date = selectedDate) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");

        if (!token || !loggedUser?.id) {
          router.push("/login");
          return;
        }

        const username = loggedUser.username || "parent1";

        const url = `${baseURL}/api/resident-fields?filters[activity_date][$eq]=${date}&filters[kid_profile][parent_users][username][$in][0]=${username}&populate=program_skill&populate=program_status&pagination[page]=${page}&pagination[pageSize]=${pagination.pageSize}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }

        const data: RawStrapiResponse<ResidentField> = await res.json();

        setFields(data.data);
        if (data.meta?.pagination) setPagination(data.meta.pagination);
      } catch (err) {
        console.error("Failed to fetch resident fields:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageSize, router, selectedDate]
  );

  useEffect(() => {
    fetchFields(pagination.page, selectedDate);
  }, [fetchFields, pagination.page, selectedDate]);

  if (loading) return <p className="p-6 text-center">Loading resident fields...</p>;

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="w-full max-w-4xl p-4 md:p-6 mx-auto">
        <h1 className="text-xl font-bold mb-6">
          {locale === "en" ? "Resident Activities" : "សកម្មភាពសិស្ស"}
        </h1>

        {/* Date Filter */}
        <div className="flex gap-2 mb-6">
          {/* Example buttons, you can map dates dynamically */}
       
       

          {/* Optional: date input picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Activity Cards */}
        <div className="space-y-4">
          {fields.map((f) => (
            <div
              key={f.id}
              className="border-2 border-blue-400 bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition"
            >
              <p className="font-semibold text-lg text-gray-900">
                {f.program_skill?.name || "Unknown Skill"}
              </p>
              <p className="text-gray-600">{f.comments}</p>
              <p className="text-sm text-gray-500">
                {locale === "en" ? "Status:" : "ស្ថានភាព:"}{" "}
                <span className="font-medium">{f.program_status?.name}</span>{" "}
                ({f.program_status?.score || 0}%)
              </p>
              <p className="text-xs text-gray-400">
                {locale === "en" ? "Date:" : "កាលបរិច្ឆេទ:"} {f.activity_date}
              </p>
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              {locale === "en"
                ? "No activity fields found."
                : "មិនមានសកម្មភាព។"}
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
