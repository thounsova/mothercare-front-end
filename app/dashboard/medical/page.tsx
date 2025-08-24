"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Eye, X, FileText } from "lucide-react";

interface Resident {
  id: number;
  documentId: string;
  locale: string;
  name: string;
  nick_name?: string;
  gender?: string;
  country?: string;
  date_of_birth?: string;
  number?: string;
  avatar?: any[];
  class?: { id: number; name: string };
  medical?: {
    id: number;
    diagnosis?: string;
    medication?: string;
    doctor?: string;
    date_of_check?: string;
    document?: string;      // Cloudinary URL
    prescription?: string;  // Cloudinary URL
  };
}

const baseURL = "http://localhost:1337";

// Avatar helper
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

// Extract first file URL
const getFileUrl = (files?: any[]) => {
  if (!files || files.length === 0) return null;
  const file = files[0];
  return file.formats?.thumbnail?.url || file.formats?.small?.url || file.url || "";
};

export default function ResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [openResident, setOpenResident] = useState<Resident | null>(null);
  const [locale, setLocale] = useState<"en" | "km">("en");

  const toggleLocale = () => setLocale((prev) => (prev === "en" ? "km" : "en"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No token found");
      setLoading(false);
      return;
    }

    fetch(
      `${baseURL}/api/medical-informations?populate=profile_resident.avatar&populate=profile_resident.class&populate=document&populate=prescription&locale=${locale}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => res.json())
      .then((json) => {
        const mapped: Resident[] = json.data.map((m: any) => {
          const r = m.profile_resident;
          return {
            id: r.id,
            documentId: r.documentId,
            locale: r.locale || "en",
            name: r.name,
            nick_name: r.nick_name,
            gender: r.gender,
            country: r.country,
            date_of_birth: r.date_of_birth,
            number: r.number,
            avatar: r.avatar,
            class: r.class,
            medical: {
              id: m.id,
              diagnosis: m.diagnosis,
              medication: m.medication,
              doctor: m.doctor,
              date_of_check: m.date_of_check,
              document: getFileUrl(m.document),
              prescription: getFileUrl(m.prescription),
            },
          };
        });
        setResidents(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [locale]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl font-medium text-gray-500">
          {locale === "en" ? "Loading residents..." : "កំពុងផ្ទុកបញ្ជីសំណាក់..."}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen py-10 px-4 bg-gray-100">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {locale === "en" ? "Residents List" : "បញ្ជីសំណាក់នៅ"}
          </h1>
          <button
            onClick={toggleLocale}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-300 font-medium text-sm"
          >
            {locale === "en" ? "🇰🇭 Khmer" : "🇬🇧 English"}
          </button>
        </div>

        {/* Residents List */}
        {residents.map((resident) => (
          <div
            key={resident.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white shadow-lg rounded-2xl p-6 transition-transform transform hover:scale-[1.01] hover:shadow-xl border border-gray-200"
          >
            {/* Main Info */}
            <div className="flex flex-grow items-center gap-6 mb-4 sm:mb-0">
              <Image
                src={getAvatarUrl(resident.avatar)}
                alt={resident.name}
                width={80}
                height={80}
                className="rounded-full object-cover border-2 border-gray-300 shadow-sm"
              />
              <div className="flex flex-col">
                <p className="font-bold text-xl text-gray-800">{resident.name}</p>
                {resident.nick_name && (
                  <p className="text-gray-500 italic text-sm mt-1">
                    ({resident.nick_name})
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <span className="font-medium text-gray-700">
                    {locale === "en" ? resident.class?.name || "N/A" : resident.class?.name || "មិនមាន"}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">
                    {locale === "en" ? resident.country || "No Country" : resident.country || "មិនមានប្រទេស"}
                  </span>
                </div>
              </div>
            </div>

            {/* View Button */}
            <button
              onClick={() => setOpenResident(resident)}
              className="mt-4 sm:mt-0 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2"
            >
              <Eye size={20} /> {locale === "en" ? "View Details" : "មើលព័ត៌មាន"}
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {openResident && (
        <div
          onClick={() => setOpenResident(null)}
          className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 p-4 sm:p-6 overflow-y-auto transition-opacity duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-6 sm:p-8 relative transform transition-all duration-300 scale-100 opacity-100"
          >
            <button
              onClick={() => setOpenResident(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
            >
              <X size={28} />
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 border-b pb-6">
              <Image
                src={getAvatarUrl(openResident.avatar)}
                alt={openResident.name}
                width={120}
                height={120}
                className="rounded-full border-4 border-blue-100 shadow-md object-cover"
              />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                  {openResident.name}
                </h2>
                {openResident.nick_name && (
                  <p className="text-gray-500 italic mt-1 text-base">
                    ({openResident.nick_name})
                  </p>
                )}
                <p className="text-gray-600 mt-2 text-lg font-medium">
                  {locale === "en" ? "Class" : "ថ្នាក់"}: {openResident.class?.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Medical Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: locale === "en" ? "Date of Birth" : "ថ្ងៃខែឆ្នាំកំណើត", value: openResident.date_of_birth },
                { label: locale === "en" ? "Gender" : "ភេទ", value: openResident.gender },
                { label: locale === "en" ? "Diagnosis" : "រោគវិនិច្ឆ័យ", value: openResident.medical?.diagnosis },
                { label: locale === "en" ? "Medication" : "ថ្នាំព្យាបាល", value: openResident.medical?.medication },
                { label: locale === "en" ? "Doctor" : "គ្រូពេទ្យ", value: openResident.medical?.doctor },
                { label: locale === "en" ? "Date of Check" : "ថ្ងៃពិនិត្យ", value: openResident.medical?.date_of_check },
                {
                  label: locale === "en" ? "Document" : "ឯកសារ",
                  value: openResident.medical?.document ? (
                    /\.(jpg|jpeg|png|gif)$/i.test(openResident.medical.document) ? (
                      <Image
                        src={openResident.medical.document}
                        alt="Document"
                        width={300}
                        height={200}
                        className="rounded-lg border border-gray-200 shadow-sm object-cover"
                      />
                    ) : (
                      <a
                        href={openResident.medical.document}
                        target="_blank"
                        className="flex items-center gap-2 text-blue-600 underline"
                      >
                        <FileText size={20} /> {locale === "en" ? "View File" : "មើលឯកសារ"}
                      </a>
                    )
                  ) : "N/A",
                },
                {
                  label: locale === "en" ? "Prescription" : "សៀវភៅថ្នាំ",
                  value: openResident.medical?.prescription ? (
                    /\.(jpg|jpeg|png|gif)$/i.test(openResident.medical.prescription) ? (
                      <Image
                        src={openResident.medical.prescription}
                        alt="Prescription"
                        width={300}
                        height={200}
                        className="rounded-lg border border-gray-200 shadow-sm object-cover"
                      />
                    ) : (
                      <a
                        href={openResident.medical.prescription}
                        target="_blank"
                        className="flex items-center gap-2 text-blue-600 underline"
                      >
                        <FileText size={20} /> {locale === "en" ? "View File" : "មើលឯកសារ"}
                      </a>
                    )
                  ) : "N/A",
                },
              ].map((field, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-500 mb-2">{field.label}</span>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 shadow-inner flex justify-center">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
