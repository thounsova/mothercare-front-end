"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";

const baseURL = "http://localhost:1337";

const getFileUrl = (files?: any[]) => {
  if (!files || files.length === 0) return null;
  const file = files[0];
  return file.url.startsWith("http") ? file.url : baseURL + file.url;
};

interface Report {
  id: number;
  documentId: string;
  date_of_upload: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  report_file?: any[];
  profile_resident?: {
    id: number;
    name: string;
    avatar?: any[];
    class?: { id: number; name: string };
  };
}

export default function ReportsPage() {
  const [locale, setLocale] = useState<"en" | "km">("en");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = async (locale: "en" | "km") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `${baseURL}/api/reports?populate=report_file&populate=profile_resident.avatar&populate=profile_resident.class&locale=${locale}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      const allReports: Report[] = data.data.map((r: any) => ({
        id: r.id,
        documentId: r.documentId,
        date_of_upload: r.date_of_upload,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        publishedAt: r.publishedAt,
        report_file: r.report_file?.data?.map((f: any) => f.attributes) || [],
        profile_resident: r.profile_resident,
      }));
      setReports(allReports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(locale);
  }, [locale]);

  if (loading)
    return <p className="p-6 text-center text-gray-600">Loading reports...</p>;

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
        {/* Top Bar */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setLocale(locale === "en" ? "km" : "en")}
            className="px-4 py-2 rounded-full border bg-white text-gray-800 shadow hover:bg-gray-100 transition"
          >
            {locale === "en" ? "🇰🇭 Khmer" : "🇬🇧 English"}
          </button>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition flex flex-col sm:flex-row items-center sm:items-start gap-4"
            >
              {/* Avatar */}
              {report.profile_resident?.avatar &&
                report.profile_resident.avatar.length > 0 && (
                  <Image
                    src={getFileUrl(report.profile_resident.avatar)!}
                    alt={report.profile_resident.name}
                    width={70}
                    height={70}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                )}

              {/* Resident Info */}
              <div className="flex-1 w-full">
                <p className="font-semibold text-lg">
                  {report.profile_resident?.name || "Unknown Resident"}
                </p>
                <p className="text-gray-500 text-sm">
                  {locale === "en" ? "Uploaded" : "បានបង្ហោះ"}:{" "}
                  {report.date_of_upload}
                </p>
                <p className="text-gray-400 text-xs">
                  {report.profile_resident?.class?.name ||
                    (locale === "en" ? "No Class" : "គ្មានថ្នាក់")}
                </p>
              </div>

              {/* View Button */}
              <button
                onClick={() => setSelectedReport(report)}
                className="mt-2 sm:mt-3 px-4 py-2 flex items-center gap-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition text-[16px] font-semibold"
              >
                <Eye size={18} />
                &nbsp;
                {locale === "en" ? "View" : "មើល"}
              </button>
            </div>
          ))}

          {reports.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              {locale === "en" ? "No reports available" : "មិនមានរបាយការណ៍ទេ"}
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl h-[85vh] overflow-y-auto p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              &times;
            </button>

            {/* Resident Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
              {selectedReport.profile_resident?.avatar &&
                selectedReport.profile_resident.avatar.length > 0 && (
                  <Image
                    src={getFileUrl(selectedReport.profile_resident.avatar)!}
                    alt={selectedReport.profile_resident.name}
                    width={100}
                    height={100}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                )}
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold">
                  {selectedReport.profile_resident?.name || "Unknown Resident"}
                </h2>
                <p className="text-gray-500">
                  Class:{" "}
                  {selectedReport.profile_resident?.class?.name ||
                    (locale === "en" ? "No Class" : "គ្មានថ្នាក់")}
                </p>
              </div>
            </div>

            {/* Report Info */}
            <div className="space-y-2 text-sm sm:text-base">
              <p>
                <strong>Document ID:</strong> {selectedReport.documentId}
              </p>
              <p>
                <strong>Created At:</strong> {selectedReport.createdAt}
              </p>
              <p>
                <strong>Updated At:</strong> {selectedReport.updatedAt}
              </p>
              <p>
                <strong>Published At:</strong> {selectedReport.publishedAt}
              </p>
              <p className="mt-2">
                <strong>Files:</strong>{" "}
                {selectedReport.report_file?.map((f) => f.name).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
