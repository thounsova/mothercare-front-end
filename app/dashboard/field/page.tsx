"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Eye } from "lucide-react";

const baseURL = "http://localhost:1337";

interface Program {
  id: number;
  documentId: string;
  activity_name: string;
  description?: string | null;
}

export default function ProgramList() {
  const router = useRouter();
  const params = useParams();
  const [locale, setLocale] = useState<"en" | "km">(
    (params.locale as "en" | "km") || "en"
  );
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${baseURL}/api/programs?locale=${locale}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      const data = await res.json();
      const allPrograms: Program[] = data.data.map((p: any) => ({
        id: p.id,
        documentId: p.documentId,
        activity_name: p.activity_name,
        description: p.description,
      }));

      setPrograms(allPrograms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPrograms();
  }, [locale]);

  const toggleLocale = () => setLocale(locale === "en" ? "km" : "en");

  if (loading)
    return (
      <p className="p-6 text-center">
        {locale === "en" ? "Loading programs..." : "កំពុងផ្ទុកកម្មវិធី..."}
      </p>
    );

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="w-full max-w-4xl p-4 md:p-6 mx-auto">
        {/* Locale toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleLocale}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-300 font-medium text-sm sm:text-base"
          >
            {locale === "en" ? "🇰🇭 Khmer" : "🇬🇧 English"}
          </button>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {programs.map((program) => (
            <div
              key={program.id}
              className="flex flex-col items-center justify-center bg-blue-600 text-white shadow-md p-6 rounded-lg hover:shadow-lg transition cursor-pointer"
            >
              <p className="font-semibold text-lg sm:text-xl">
                {program.activity_name}
              </p>
              {program.description && (
                <p className="text-gray-200 text-sm mt-1 text-center">
                  {program.description}
                </p>
              )}
              <button
                className="flex items-center justify-center gap-2 mt-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-800 text-sm sm:text-base hover:bg-blue-200 transition"
                onClick={() =>
                  router.push(
                    `/dashboard/${locale}/program/${program.documentId}/skills`
                  )
                }
              >
                <Eye size={18} />
                {locale === "en" ? "VIEW" : "មើល"}
              </button>
            </div>
          ))}
        </div>

        {programs.length === 0 && (
          <p className="text-center text-gray-500 mt-6">
            {locale === "en" ? "No programs found." : "មិនមានកម្មវិធីទេ។"}
          </p>
        )}
      </div>
    </div>
  );
}
