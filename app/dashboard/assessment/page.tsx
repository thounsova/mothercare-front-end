"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";

const baseURL = "https://energized-fireworks-cc618580b1.strapiapp.com";

// Helper to get avatar URL
const getAvatarUrl = (avatar?: any) => {
  if (!avatar) return "/default-avatar.png";
  const url =
    avatar.formats?.thumbnail?.url ||
    avatar.formats?.small?.url ||
    avatar.url ||
    "";
  return url.startsWith("http") ? url : baseURL + url;
};

// Helper to get file URL
const getFileUrl = (file?: any) => {
  if (!file) return "";
  const url = file.url;
  return url.startsWith("http") ? url : baseURL + url;
};

interface AssessmentFile {
  id: number;
  name?: string;
  url?: string;
}

interface Assessment {
  id: number;
  assessment_file?: AssessmentFile[];
}

interface Report {
  id: number;
  date_of_upload?: string;
  assessments?: Assessment[];
  resident: {
    id: number;
    full_name: string;
    avatar?: any;
    class?: { id: number; name: string };
  };
}

export default function ReportsPage() {
  const [locale, setLocale] = useState<"en" | "km">("en");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token || !loggedUser?.id) return;

      const res = await fetch(
        `${baseURL}/api/profile-residents?populate=avatar&populate=class&populate=parent_users&populate=educator_user&populate=assessments.assessment_file`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      // Filter residents where logged user is parent or educator
      const myResidents = data.data.filter((r: any) => {
        const isParent = r.parent_users?.some((p: any) => p.id === loggedUser.id) ?? false;
        const isEducator = r.educator_user?.id === loggedUser.id;
        return isParent || isEducator;
      });

      // Flatten assessments as reports
      const allReports: Report[] = myResidents.flatMap((r: any) =>
        (r.assessments || []).map((assess: any) => ({
          id: assess.id,
          date_of_upload: assess.createdAt,
          assessments: [assess],
          resident: {
            id: r.id,
            full_name: r.full_name,
            avatar: r.avatar,
            class: r.class ? { id: r.class.id, name: r.class.name } : undefined,
          },
        }))
      );

      setReports(allReports);
    } catch (err) {
      console.error("Failed to fetch assessments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading)
    return <p className="p-6 text-center text-gray-600">Loading assessments...</p>;

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
        {/* Top Bar */}
        <div className="flex justify-end mb-6">
          {/* <button
            onClick={() => setLocale(locale === "en" ? "km" : "en")}
            className="px-4 py-2 rounded-full border bg-white text-gray-800 shadow hover:bg-gray-100 transition"
          >
            {locale === "en" ? "🇰🇭 Khmer" : "🇬🇧 English"}
          </button> */}
        </div>

        {/* Assessments List */}
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Image
                  src={getAvatarUrl(report.resident.avatar)}
                  alt={report.resident.full_name}
                  width={70}
                  height={70}
                  className="rounded-full border-2 border-blue-400"
                />
              </div>

              {/* Resident Info */}
              <div className="flex-1 w-full text-center sm:text-left">
                <p className="font-semibold text-lg sm:text-xl text-gray-800 truncate">
                  {report.resident.full_name}
                </p>
                <p className="text-gray-500 text-sm sm:text-base mt-1">
                  {locale === "en" ? "Uploaded" : "បានបង្ហោះ"}: {report.date_of_upload}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  {report.resident.class?.name || (locale === "en" ? "No Class" : "គ្មានថ្នាក់")}
                </p>
              </div>

              {/* View Button */}
              <div className="flex-shrink-0 mt-2 sm:mt-0">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="flex items-center justify-center gap-2 mt-5 px-4 py-2 rounded-lg bg-blue-100 text-blue-800 text-sm sm:text-base hover:bg-blue-200 transition"
                >
                  <Eye size={18} />
                  {locale === "en" ? "View" : "មើល"}
                </button>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <p className="text-center text-gray-500 mt-6 text-sm sm:text-base">
              {locale === "en" ? "No assessments available" : "មិនមានការវាយតម្លៃទេ"}
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl h-[50vh] overflow-y-auto p-8 relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold"
            >
              &times;
            </button>

            {/* Resident Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 border-b pb-4">
              <Image
                src={getAvatarUrl(selectedReport.resident.avatar)}
                alt={selectedReport.resident.full_name}
                width={100}
                height={100}
                className="rounded-full border-2 border-blue-400 object-cover"
              />
              <div>
                <h2 className="text-3xl font-bold">{selectedReport.resident.full_name}</h2>
                <p className="text-gray-500">
                  {locale === "en" ? "Class" : "ថ្នាក់"}: {selectedReport.resident.class?.name || (locale === "en" ? "No Class" : "គ្មានថ្នាក់")}
                </p>
              </div>
            </div>

            {/* Assessment Files Section */}
            {selectedReport.assessments?.length ? (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">📝 Assessment Files</h3>
                {selectedReport.assessments.map((assess) => (
                  <ul key={assess.id} className="list-disc pl-5 text-blue-600 mb-2">
                    {assess.assessment_file?.map((f: any) => (
                      <li key={f.id}>
                        <a
                          href={getFileUrl(f)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-blue-800"
                        >
                          {f.name || "File"}
                        </a>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{locale === "en" ? "No files available" : "គ្មានឯកសារ"}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
