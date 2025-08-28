"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

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

interface ResidentInfo {
  id: number;
  documentId: string;
  full_name: string;
  avatar?: MediaFile | MediaFile[];
  class?: ClassInfo;
}

interface MedicalInfo {
  id: number;
  diagnosis?: string;
  medication?: string;
  doctor?: string;
  date_of_check?: string;
  document?: MediaFile[];
  prescription?: MediaFile[];
}

interface ResidentAPI {
  id: number;
  documentId: string;
  full_name: string;
  avatar?: MediaFile | { data?: MediaFile } | MediaFile[];
  class?: { id: number; name: string } | null;
  parent_users?: { id: number }[];
  educator_user?: { id: number } | null;
  medical_informations?: MedicalInfo[];
}

interface Medical {
  id: number;
  diagnosis?: string;
  medication?: string;
  doctor?: string;
  date_of_check?: string;
  document?: MediaFile[];
  prescription?: MediaFile[];
  resident: ResidentInfo;
}

// ✅ Helper to get avatar URL
const getAvatarUrl = (avatar?: MediaFile | MediaFile[]): string => {
  if (!avatar) return "/default-avatar.png";
  const av = Array.isArray(avatar) ? avatar[0] : avatar;
  const url = av?.formats?.thumbnail?.url || av?.formats?.small?.url || av?.url || "";
  return url.startsWith("http") ? url : baseURL + url;
};

// ✅ Helper to get file URL
const getFileUrl = (file?: MediaFile): string => {
  if (!file) return "";
  return file.url.startsWith("http") ? file.url : baseURL + file.url;
};

export default function MedicalPage() {
  const router = useRouter();
  const params = useParams();
  const locale = ((params.locale as "en" | "km") || "en") as "en" | "km";
  const [medicalList, setMedicalList] = useState<Medical[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedical, setSelectedMedical] = useState<Medical | null>(null);

  const fetchMedical = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token || !loggedUser?.id) {
        router.push("/login");
        return;
      }

      const res = await fetch(
        `${baseURL}/api/profile-residents?populate=avatar&populate=class&populate=medical_informations.document&populate=medical_informations.prescription&populate=parent_users&populate=educator_user`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const residentData: { data: ResidentAPI[] } = await res.json();

      const myResidents = residentData.data.filter((r: ResidentAPI) => {
        const isParent = r.parent_users?.some((p) => p.id === loggedUser.id) ?? false;
        const isEducator = r.educator_user?.id === loggedUser.id;
        return isParent || isEducator;
      });

      const allMedical: Medical[] = myResidents.flatMap((r: ResidentAPI) =>
        (r.medical_informations || []).map((m) => ({
          id: m.id,
          diagnosis: m.diagnosis,
          medication: m.medication,
          doctor: m.doctor,
          date_of_check: m.date_of_check,
          document: m.document || [],
          prescription: m.prescription || [],
          resident: {
            id: r.id,
            documentId: r.documentId,
            full_name: r.full_name,
            avatar: r.avatar as MediaFile | MediaFile[],
            class: r.class ? { id: r.class.id, name: r.class.name } : undefined,
          },
        }))
      );

      setMedicalList(allMedical);
    } catch (err) {
      console.error("Failed to fetch medical:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMedical();
  }, [fetchMedical]);

  if (loading) return <p className="p-6 text-center">Loading medical info...</p>;

  return (
    <div className="p-6 relative">
      <h1 className="text-3xl font-bold mb-8">
        {locale === "en" ? "Medical Records" : "កំណត់ត្រាវេជ្ជសាស្ត្រ"}
      </h1>

      {medicalList.length === 0 && (
        <p className="text-gray-500 mb-4">
          {locale === "en"
            ? "No medical records available for your residents."
            : "មិនមានកំណត់ត្រាវេជ្ជសាស្ត្រ។"}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {medicalList.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-2xl shadow-md border border-blue-400 p-4 sm:p-6 flex flex-col justify-between"
          >
            <div className="flex items-center gap-4 mb-4">
              <Image
                src={getAvatarUrl(m.resident.avatar)}
                alt={m.resident.full_name}
                width={60}
                height={60}
                className="rounded-full border-2 border-blue-400"
              />
              <div className="flex-1">
                <p className="font-semibold text-lg">{m.resident.full_name}</p>
                <p className="text-sm text-gray-500">{m.resident.class?.name || "No Class"}</p>
              </div>
            </div>
            <button
              className="mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-800 text-sm sm:text-base hover:bg-blue-200 transition"
              onClick={() => setSelectedMedical(m)}
            >
              {locale === "en" ? "View Details" : "មើលព័ត៌មានលំអិត"}
            </button>
          </div>
        ))}
      </div>

      {selectedMedical && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-xl p-6 relative flex flex-col max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
              onClick={() => setSelectedMedical(null)}
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 sm:mb-6 border-b pb-4">
              <Image
                src={getAvatarUrl(selectedMedical.resident.avatar)}
                alt={selectedMedical.resident.full_name}
                width={80}
                height={80}
                className="rounded-full border-2 border-blue-400"
              />
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold">{selectedMedical.resident.full_name}</h2>
                <p className="text-gray-500 text-sm">{selectedMedical.resident.class?.name || "No Class"}</p>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 space-y-6 pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: locale === "en" ? "Diagnosis" : "រោគវិនិច្ឆ័យ", value: selectedMedical.diagnosis },
                  { label: locale === "en" ? "Medication" : "ថ្នាំ", value: selectedMedical.medication },
                  { label: locale === "en" ? "Doctor" : "វេជ្ជបណ្ឌិត", value: selectedMedical.doctor },
                  { label: locale === "en" ? "Date of Check" : "កាលបរិច្ឆេទពិនិត្យ", value: selectedMedical.date_of_check },
                ].map((field, idx) => (
                  <div key={idx}>
                    <label className="block text-gray-600 font-semibold mb-1">{field.label}</label>
                    <input
                      type="text"
                      value={field.value || ""}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-800 text-lg"
                    />
                  </div>
                ))}
              </div>

              {selectedMedical.document && selectedMedical.document.length > 0 && (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-2">📄 Documents:</h3>
                  <ul className="list-disc pl-5 text-blue-600 space-y-1">
                    {selectedMedical.document.map((doc) => (
                      <li key={doc.id}>
                        <a href={getFileUrl(doc)} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                          {doc.name || "Document"}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedMedical.prescription && selectedMedical.prescription.length > 0 && (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-700 mb-2">💊 Prescriptions:</h3>
                  <ul className="list-disc pl-5 text-blue-600 space-y-1">
                    {selectedMedical.prescription.map((pres) => (
                      <li key={pres.id}>
                        <a href={getFileUrl(pres)} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                          {pres.name || "Prescription"}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
