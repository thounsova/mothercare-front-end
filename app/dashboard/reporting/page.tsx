"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";

const baseURL = "https://energized-fireworks-cc618580b1.strapiapp.com";

// -------------------- Types --------------------
interface StrapiFileFormat {
  url: string;
  ext?: string;
  width?: number;
  height?: number;
  size?: number;
}

interface StrapiFile {
  id: number;
  name?: string;
  url: string;
  formats?: {
    small?: StrapiFileFormat;
    thumbnail?: StrapiFileFormat;
    medium?: StrapiFileFormat;
    large?: StrapiFileFormat;
  };
}

type MediaFile = StrapiFile;
type ReportFile = StrapiFile;

interface ClassInfo {
  id: number;
  name: string;
}

interface ParentUser {
  id: number;
}

interface EducatorUser {
  id: number;
}

interface ReportData {
  id: number;
  documentId: string;
  date_of_upload?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  report_file?: ReportFile[];
}

interface Resident {
  id: number;
  full_name: string;
  avatar?: MediaFile;
  class?: ClassInfo;
  parent_users?: ParentUser[];
  educator_user?: EducatorUser;
  reports?: ReportData[];
}

interface Report {
  id: number;
  documentId: string;
  date_of_upload?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  report_file?: ReportFile[];
  resident: {
    id: number;
    full_name: string;
    avatar?: MediaFile;
    class?: ClassInfo;
  };
}

// -------------------- Helpers --------------------
const getAvatarUrl = (file?: MediaFile): string => {
  if (!file) return "/default-avatar.png";
  const url = file.formats?.thumbnail?.url || file.formats?.small?.url || file.url;
  return url.startsWith("http") ? url : baseURL + url;
};

const getFileUrl = (file?: ReportFile): string => {
  if (!file) return "";
  const url = file.formats?.small?.url || file.url;
  return url.startsWith("http") ? url : baseURL + url;
};

// -------------------- Component --------------------
export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterDate, setFilterDate] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const loggedUserStr = localStorage.getItem("user");
      const loggedUser = loggedUserStr ? JSON.parse(loggedUserStr) : null;

      if (!token || !loggedUser?.id) return;

      const res = await fetch(
        `${baseURL}/api/profile-residents?populate=avatar&populate=class&populate=parent_users&populate=educator_user&populate=reports.report_file`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      const residents: Resident[] = data.data;

      // ✅ Filter residents where the logged user is parent or educator
      const myResidents = residents.filter((r) => {
        const isParent = r.parent_users?.some((p) => p.id === loggedUser.id) ?? false;
        const isEducator = r.educator_user?.id === loggedUser.id;
        return isParent || isEducator;
      });

      // ✅ Flatten reports
      const allReports: Report[] = myResidents.flatMap((r) =>
        (r.reports || []).map((rep) => ({
          id: rep.id,
          documentId: rep.documentId,
          date_of_upload: rep.date_of_upload,
          createdAt: rep.createdAt,
          updatedAt: rep.updatedAt,
          publishedAt: rep.publishedAt,
          report_file: rep.report_file || [],
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
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ✅ Apply date filter
  const filteredReports = filterDate
    ? reports.filter((r) =>
        (r.date_of_upload || r.createdAt || "").startsWith(filterDate)
      )
    : reports;

  if (loading)
    return <p className="p-6 text-center text-gray-600">Loading reports...</p>;

  return (
    <div className="min-h-screen py-10  bg-gray-50">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
          />
        </div>

        {/* Reports Grid */}
        <div className="grid gap-6  sm:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl shadow-md border border-blue-500 p-5 flex flex-col items-center sm:items-start text-center sm:text-left hover:shadow-lg transition"
            >
              {/* Avatar */}
              <Image
                src={getAvatarUrl(report.resident.avatar)}
                alt={report.resident.full_name}
                width={80}
                height={80}
                className="rounded-full border-2 border-blue-400 mb-3"
              />

              {/* Info */}
              <h2 className="font-semibold text-lg text-gray-800 truncate">
                {report.resident.full_name}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Uploaded: {report.date_of_upload || report.createdAt}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {report.resident.class?.name || "No Class"}
              </p>

              {/* Button */}
              <button
                onClick={() => setSelectedReport(report)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition"
              >
                <Eye size={16} /> View
              </button>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <p className="text-center text-gray-500 mt-10 text-sm">
            No reports available for this date.
          </p>
        )}
      </div>

      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8 relative">
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
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedReport.resident.full_name}
                </h2>
                <p className="text-gray-500">
                  Class: {selectedReport.resident.class?.name || "No Class"}
                </p>
              </div>
            </div>

            {/* Report Files */}
            {selectedReport.report_file?.length ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-2">📄 Files</h3>
                <ul className="list-disc pl-5 text-blue-600 space-y-1">
                  {selectedReport.report_file.map((f) => (
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
            ) : (
              <p className="text-gray-500">No files available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}