"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";

const baseURL = "https://energized-fireworks-cc618580b1.strapiapp.com";

// ✅ Types
interface MediaFile {
  id: number;
  name?: string;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
  };
}

interface AssessmentFile {
  id: number;
  name?: string;
  url: string;
}

interface Assessment {
  id: number;
  createdAt?: string;
  assessment_file?: AssessmentFile[];
}

interface ClassInfo {
  id: number;
  name: string;
}

interface Resident {
  id: number;
  full_name: string;
  avatar?: MediaFile;
  class?: ClassInfo;
  parent_users?: { id: number }[];
  educator_user?: { id: number };
  assessments?: Assessment[];
}

interface Report {
  id: number;
  date_of_upload?: string;
  assessments: Assessment[];
  resident: {
    id: number;
    full_name: string;
    avatar?: MediaFile;
    class?: ClassInfo;
  };
}

// ✅ Helpers
const getAvatarUrl = (avatar?: MediaFile): string => {
  if (!avatar) return "/default-avatar.png";
  const url =
    avatar.formats?.thumbnail?.url ||
    avatar.formats?.small?.url ||
    avatar.url ||
    "";
  return url.startsWith("http") ? url : baseURL + url;
};

const getFileUrl = (file?: AssessmentFile): string => {
  if (!file?.url) return "";
  return file.url.startsWith("http") ? file.url : baseURL + file.url;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterDate, setFilterDate] = useState<string>("");

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

      const residents: Resident[] = data.data;

      // ✅ Filter residents
      const myResidents = residents.filter((r) => {
        const isParent = r.parent_users?.some((p) => p.id === loggedUser.id) ?? false;
        const isEducator = r.educator_user?.id === loggedUser.id;
        return isParent || isEducator;
      });

      // ✅ Flatten assessments
      const allReports: Report[] = myResidents.flatMap((r) =>
        (r.assessments || []).map((assess) => ({
          id: assess.id,
          date_of_upload: assess.createdAt,
          assessments: [assess],
          resident: {
            id: r.id,
            full_name: r.full_name,
            avatar: r.avatar,
            class: r.class,
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

  // ✅ Filter reports by selected date
  const filteredReports = filterDate
    ? reports.filter((r) =>
        r.date_of_upload?.startsWith(filterDate)
      )
    : reports;

  if (loading)
    return <p className="p-6 text-center text-gray-600">Loading assessments...</p>;

  return (
    <div className="min-h-screen py-10 bg-gray-100">
      <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
        
        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center sm:text-left">
          📊 Assessments
        </h1>

        {/* Date Filter */}
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Assessments List */}
        <div className="space-y-5">
          {filteredReports.length ? (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl shadow-md border border-blue-400 p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 hover:shadow-lg transition"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Image
                    src={getAvatarUrl(report.resident.avatar)}
                    alt={report.resident.full_name}
                    width={70}
                    height={70}
                    className="rounded-full mt-3 border-2 border-blue-400"
                  />
                </div>

                {/* Resident Info */}
                <div className="flex-1 w-full text-center sm:text-left">
                  <p className="font-semibold text-lg sm:text-xl text-gray-800 truncate">
                    {report.resident.full_name}
                  </p>
                  <p className="text-gray-500 text-sm sm:text-base mt-1">
                    Uploaded: {report.date_of_upload}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                    {report.resident.class?.name || "No Class"}
                  </p>
                </div>

                {/* View Button */}
                <div className="flex-shrink-0 mt-2 sm:mt-0">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="flex items-center mt-4 justify-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-800 text-sm sm:text-base hover:bg-blue-100 transition shadow-sm"
                  >
                    <Eye size={18} />
                    View
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-6 text-sm sm:text-base">
              No assessments available
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl h-[60vh] overflow-y-auto p-6 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-2xl font-bold"
            >
              &times;
            </button>

            {/* Resident Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 border-b border-gray-200 pb-4">
              <Image
                src={getAvatarUrl(selectedReport.resident.avatar)}
                alt={selectedReport.resident.full_name}
                width={100}
                height={100}
                className="rounded-full border-2 border-blue-400 object-cover"
              />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {selectedReport.resident.full_name}
                </h2>
                <p className="text-gray-500 mt-1">
                  Class: {selectedReport.resident.class?.name || "No Class"}
                </p>
              </div>
            </div>

            {/* Assessment Files */}
            {selectedReport.assessments?.length ? (
              <div className="space-y-4">
                {selectedReport.assessments.map((assess) => (
                  <div
                    key={assess.id}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-sm hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-gray-700 mb-2">📝 Assessment Files</h3>
                    <ul className="list-disc pl-5 text-blue-600">
                      {assess.assessment_file?.map((f) => (
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No files available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}