"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

interface ClassInfo {
  id: number;
  name: string;
}

interface Resident {
  id: number;
  documentId: string;
  name: string;
  nick_name?: string;
  gender?: string;
  date_of_birth?: string;
  Mother_name?: string;
  Father_name?: string;
  address_parents?: string;
  address_kinds?: string;
  number?: string;
  avatar?: MediaFile | MediaFile[];
  comments?: string;
  class?: ClassInfo | null;
}

interface Medical {
  id: number;
  diagnosis?: string;
  medication?: string;
  doctor?: string;
  date_of_check?: string;
  document?: MediaFile[];
  prescription?: MediaFile[];
}

// ✅ Helper: Avatar
const getAvatarUrl = (avatar?: MediaFile | MediaFile[]): string => {
  if (!avatar) return "/default-avatar.png";
  const av = Array.isArray(avatar) ? avatar[0] : avatar;
  const url =
    av?.formats?.thumbnail?.url ||
    av?.formats?.small?.url ||
    av?.url ||
    "/default-avatar.png";
  return url.startsWith("http") ? url : baseURL + url;
};

// ✅ Helper: File URL
const getFileUrl = (file?: MediaFile): string => {
  if (!file) return "";
  return file.url.startsWith("http") ? file.url : baseURL + file.url;
};

export default function ResidentProfile() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [locale] = useState<"en" | "km">("en"); // Removed unused setLocale
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Medical
  const [medicalList, setMedicalList] = useState<Medical[]>([]);
  const [loadingMedical, setLoadingMedical] = useState(false);
  const [showMedical, setShowMedical] = useState(false);

  // ✅ Fetch Resident
  useEffect(() => {
    async function fetchResident() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(
          `${baseURL}/api/profile-residents?filters[documentId][$eq]=${documentId}&populate=avatar&populate=class&locale=${locale}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }

        const data = await res.json();
        if (data.data?.length > 0) {
          const r = data.data[0];

          const avatarData: MediaFile | MediaFile[] | undefined =
            r.avatar?.data || r.avatar;

          setResident({
            id: r.id,
            documentId: r.documentId,
            name: r.name || r.full_name || "N/A",
            nick_name: r.nick_name,
            gender: r.gender,
            date_of_birth: r.date_of_birth,
            Mother_name: r.Mother_name,
            Father_name: r.Father_name,
            address_parents: r.address_parents,
            address_kinds: r.address_kinds,
            number: r.number,
            avatar: avatarData,
            comments: r.comments,
            class: r.class?.data
              ? { id: r.class.data.id, name: r.class.data.name }
              : r.class || null,
          });
        } else {
          setResident(null);
        }
      } catch (err) {
        console.error(err);
        setResident(null);
      } finally {
        setLoading(false);
      }
    }

    fetchResident();
  }, [documentId, locale, router]);

  // ✅ Fetch Medical Records
  const fetchMedical = async () => {
    try {
      setLoadingMedical(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `${baseURL}/api/profile-residents/${documentId}?populate[medical_informations][populate][0]=document&populate[medical_informations][populate][1]=prescription&locale=${locale}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      const medicals: Medical[] = data.data?.medical_informations || [];
      setMedicalList(medicals);
      setShowMedical(true);
    } catch (err) {
      console.error("Failed to fetch medical:", err);
    } finally {
      setLoadingMedical(false);
    }
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500 text-lg">
        {locale === "en" ? "Loading profile..." : "កំពុងផ្ទុកព័ត៌មាន..."}
      </p>
    );
  if (!resident)
    return (
      <p className="p-6 text-center text-gray-500 text-lg">
        {locale === "en" ? "Resident not found." : "មិនមានព័ត៌មានសិស្ស។"}
      </p>
    );

  const detailsData = [
    { label: locale === "en" ? "Date of Birth" : "ថ្ងៃកំណើត", value: resident.date_of_birth },
    { label: locale === "en" ? "Gender" : "ភេទ", value: resident.gender },
    { label: locale === "en" ? "Mother's Name" : "ឈ្មោះម្តាយ", value: resident.Mother_name },
    { label: locale === "en" ? "Father's Name" : "ឈ្មោះឪពុក", value: resident.Father_name },
    { label: locale === "en" ? "Parents' Address" : "អាសយដ្ឋានមាតាបិតា", value: resident.address_parents },
    { label: locale === "en" ? "Resident Address" : "អាសយដ្ឋានសិស្ស", value: resident.address_kinds },
    { label: locale === "en" ? "Contact Number" : "លេខទំនាក់ទំនង", value: resident.number },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-md border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {locale === "en" ? "Resident Profile" : "ប្រវត្តិរូបសិស្ស"}
        </h2>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
        <Image
          src={getAvatarUrl(resident.avatar)}
          alt={resident.name || "Resident Avatar"}
          width={160}
          height={160}
          className="rounded-full object-cover border-4 border-gray-200 shadow-md"
        />
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">{resident.name}</h1>
          <p className="text-gray-600 mt-2">
            {locale === "en" ? "Class" : "ថ្នាក់"}: {resident.class?.name || "N/A"}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border">
        {detailsData.map((field, idx) => (
          <div key={idx} className="flex flex-col">
            <span className="text-sm sm:text-base font-semibold text-gray-500 mb-1">
              {field.label}
            </span>
            <p className="p-3 bg-white border rounded-lg text-gray-700 shadow-sm sm:text-base">
              {field.value || "N/A"}
            </p>
          </div>
        ))}

        {/* Comments */}
        <div className="flex flex-col sm:col-span-2">
          <span className="text-sm sm:text-base font-semibold text-gray-500 mb-1">
            {locale === "en" ? "Comments" : "មតិយោបល់"}
          </span>
          <div
            className="p-3 h-40 bg-white border rounded-lg text-gray-700 shadow-sm overflow-auto sm:text-base"
            dangerouslySetInnerHTML={{
              __html: resident.comments || "N/A",
            }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={fetchMedical}
          className="flex-1  bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          {loadingMedical
            ? locale === "en"
              ? "Loading..."
              : "កំពុងផ្ទុក..."
            : locale === "en"
            ? "Medical Records"
            : "កំណត់ត្រាពេទ្យ"}
        </button>
        <Link href="/dashboard/resident" className="flex-1">
          <button className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300">
            {locale === "en" ? "Back" : "ត្រលប់"}
          </button>
        </Link>
      </div>

      {/* ✅ Medical Modal */}
      {showMedical && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-xl p-6 relative flex flex-col max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
              onClick={() => setShowMedical(false)}
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center">
              {locale === "en" ? "Medical Records" : "កំណត់ត្រាពេទ្យ"}
            </h2>

            {medicalList.length === 0 ? (
              <p className="text-center text-gray-600">
                {locale === "en" ? "No records found." : "មិនមានទិន្នន័យ។"}
              </p>
            ) : (
              <div className="space-y-6">
                {medicalList.map((m) => (
                  <div
                    key={m.id}
                    className="border rounded-xl p-5 bg-gray-50 shadow-sm hover:shadow-md transition"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-gray-700 font-semibold mb-1">
                          {locale === "en" ? "Diagnosis" : "រោគវិនិច្ឆ័យ"}
                        </span>
                        <p className="w-full border rounded-lg p-3 bg-white text-gray-800">
                          {m.diagnosis || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="block text-gray-700 font-semibold mb-1">
                          {locale === "en" ? "Medication" : "ថ្នាំ"}
                        </span>
                        <p className="w-full border rounded-lg p-3 bg-white text-gray-800">
                          {m.medication || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="block text-gray-700 font-semibold mb-1">
                          {locale === "en" ? "Doctor" : "គ្រូពេទ្យ"}
                        </span>
                        <p className="w-full border rounded-lg p-3 bg-white text-gray-800">
                          {m.doctor || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="block text-gray-700 font-semibold mb-1">
                          {locale === "en" ? "Date of Check" : "ថ្ងៃពិនិត្យ"}
                        </span>
                        <p className="w-full border rounded-lg p-3 bg-white text-gray-800">
                          {m.date_of_check || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Documents */}
                    {m.document?.length ? (
                      <div className="mt-4">
                        <b>📄 {locale === "en" ? "Documents" : "ឯកសារ"}:</b>
                        <ul className="list-disc pl-5 text-blue-600">
                          {m.document.map((doc) => (
                            <li key={doc.id}>
                              <a
                                href={getFileUrl(doc)}
                                target="_blank"
                                rel="noreferrer"
                                className="underline hover:text-blue-800"
                              >
                                {doc.name || (locale === "en" ? "Document" : "ឯកសារ")}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {/* Prescriptions */}
                    {m.prescription?.length ? (
                      <div className="mt-4">
                        <b>💊 {locale === "en" ? "Prescriptions" : "វេជ្ជបញ្ជា"}:</b>
                        <ul className="list-disc pl-5 text-blue-600">
                          {m.prescription.map((pres) => (
                            <li key={pres.id}>
                              <a
                                href={getFileUrl(pres)}
                                target="_blank"
                                rel="noreferrer"
                                className="underline hover:text-blue-800"
                              >
                                {pres.name || (locale === "en" ? "Prescription" : "វេជ្ជបញ្ជា")}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
