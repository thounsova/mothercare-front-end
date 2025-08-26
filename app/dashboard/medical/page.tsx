"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

const baseURL = "https://energized-fireworks-cc618580b1.strapiapp.com";

// ✅ Helper to get avatar URL
const getAvatarUrl = (avatar?: any) => {
  if (!avatar) return "/default-avatar.png";
  const url =
    avatar.formats?.thumbnail?.url ||
    avatar.formats?.small?.url ||
    avatar.url ||
    "";
  return url.startsWith("http") ? url : baseURL + url;
};

// ✅ Helper to get file URL
const getFileUrl = (file?: any) => {
  if (!file) return "";
  const url = file.url;
  return url?.startsWith("http") ? url : baseURL + url;
};

interface Medical {
  id: number;
  diagnosis?: string;
  medication?: string;
  doctor?: string;
  date_of_check?: string;
  document?: any[];
  prescription?: any[];
  resident: {
    id: number;
    documentId: string;
    full_name: string;
    avatar?: any;
    class?: { id: number; name: string };
  };
}

export default function MedicalPage() {
  const router = useRouter();
  const params = useParams();
  const [locale, setLocale] = useState<"en" | "km">(
    (params.locale as "en" | "km") || "en"
  );
  const [medicalList, setMedicalList] = useState<Medical[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedical, setSelectedMedical] = useState<Medical | null>(null);

  const fetchMedical = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token || !loggedUser?.id) {
        router.push("/login");
        return;
      }

      const residentRes = await fetch(
        `${baseURL}/api/profile-residents?populate=avatar&populate=class&populate=medical_informations.document&populate=medical_informations.prescription&populate=parent_users&populate=educator_user`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const residentData = await residentRes.json();

      const myResidents = residentData.data.filter((r: any) => {
        const isParent =
          r.parent_users?.some((p: any) => p.id === loggedUser.id) ?? false;
        const isEducator = r.educator_user?.id === loggedUser.id;
        return isParent || isEducator;
      });

      const allMedical: Medical[] = myResidents.flatMap((r: any) =>
        (r.medical_informations || []).map((m: any) => ({
          id: m.id,
          diagnosis: m.diagnosis,
          medication: m.medication,
          doctor: m.doctor,
          date_of_check: m.date_of_check,
          document: m.document,
          prescription: m.prescription,
          resident: {
            id: r.id,
            documentId: r.documentId,
            full_name: r.full_name,
            avatar: r.avatar,
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
  };

  useEffect(() => {
    fetchMedical();
  }, []);

  if (loading)
    return <p className="p-6 text-center">Loading medical info...</p>;

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

      {/* ✅ Medical List Cards */}
      <div className="space-y-6">
        {medicalList.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <Image
                src={getAvatarUrl(m.resident.avatar)}
                alt={m.resident.full_name}
                width={60}
                height={60}
                className="rounded-full border-2 border-blue-400"
              />
              <div>
                <p className="font-semibold text-lg">{m.resident.full_name}</p>
                <p className="text-sm text-gray-500">
                  {m.resident.class?.name || "No Class"}
                </p>
              </div>
            </div>

            <button
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-800 text-sm sm:text-base hover:bg-blue-200 transition"
              onClick={() => setSelectedMedical(m)}
            >
              {locale === "en" ? "View Details" : "មើលព័ត៌មានលំអិត"}
            </button>
          </div>
        ))}
      </div>

      {/* ✅ Modal Popup */}
      {selectedMedical && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-xl p-8 relative">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
              onClick={() => setSelectedMedical(null)}
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6 border-b pb-4">
              <Image
                src={getAvatarUrl(selectedMedical.resident.avatar)}
                alt={selectedMedical.resident.full_name}
                width={80}
                height={80}
                className="rounded-full border-2 border-blue-400"
              />
              <div>
                <h2 className="text-3xl font-bold">
                  {selectedMedical.resident.full_name}
                </h2>
                <p className="text-gray-500 text-sm">
                  {selectedMedical.resident.class?.name || "No Class"}
                </p>
              </div>
            </div>

            {/* Form-like Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">
                  {locale === "en" ? "Diagnosis" : "រោគវិនិច្ឆ័យ"}
                </label>
                <input
                  type="text"
                  value={selectedMedical.diagnosis || ""}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-800 text-lg"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">
                  {locale === "en" ? "Medication" : "ថ្នាំ"}
                </label>
                <input
                  type="text"
                  value={selectedMedical.medication || ""}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-800 text-lg"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">
                  {locale === "en" ? "Doctor" : "វេជ្ជបណ្ឌិត"}
                </label>
                <input
                  type="text"
                  value={selectedMedical.doctor || ""}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-800 text-lg"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">
                  {locale === "en" ? "Date of Check" : "កាលបរិច្ឆេទពិនិត្យ"}
                </label>
                <input
                  type="text"
                  value={selectedMedical.date_of_check || ""}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-800 text-lg"
                />
              </div>
            </div>

          {/* Documents */}
{selectedMedical.document && selectedMedical.document.length > 0 && (
  <div className="mb-4 border border-gray-300 rounded-lg p-4 bg-gray-50">
    <h3 className="font-semibold text-gray-700 mb-2">📄 Documents:</h3>
    <ul className="list-disc pl-5 text-blue-600">
      {selectedMedical.document.map((doc: any) => (
        <li key={doc.id}>
          <a
            href={getFileUrl(doc)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-800"
          >
            {doc.name || "Document"}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}

{/* Prescriptions */}
{selectedMedical.prescription &&
  selectedMedical.prescription.length > 0 && (
    <div className="mb-4 border border-gray-300 rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold text-gray-700 mb-2">💊 Prescriptions:</h3>
      <ul className="list-disc pl-5 text-blue-600">
        {selectedMedical.prescription.map((pres: any) => (
          <li key={pres.id}>
            <a
              href={getFileUrl(pres)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
              {pres.name || "Prescription"}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )}
          </div>
        </div>
      )}
    </div>
  );
}
