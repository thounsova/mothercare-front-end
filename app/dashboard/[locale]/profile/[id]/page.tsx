"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

// Resident type
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
  avatar?: any[];
  comments?: string;
  class?: {
    id: number;
    name: string;
  };
}

export default function ResidentProfile() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [locale, setLocale] = useState<"en" | "km">("en");
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);

  const toggleLocale = () => setLocale((prev) => (prev === "en" ? "km" : "en"));

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
          setResident({
            id: r.id,
            documentId: r.documentId,
            name: r.name,
            nick_name: r.nick_name,
            gender: r.gender,
            date_of_birth: r.date_of_birth,
            Mother_name: r.Mother_name,
            Father_name: r.Father_name,
            address_parents: r.address_parents,
            address_kinds: r.address_kinds,
            number: r.number,
            avatar: r.avatar,
            comments: r.comments,
            class: r.class,
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
  }, [documentId, locale]);

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500 text-lg">Loading profile...</p>
    );
  if (!resident)
    return (
      <p className="p-6 text-center text-gray-500 text-lg">Resident not found.</p>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-md border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Resident Profile
        </h2>
  <button
  onClick={toggleLocale}
  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-300 font-medium text-sm sm:text-base"
>
  {locale === "en" ? "🇰🇭 Khmer" : "🇬🇧 English"}
</button>

      </div>

      {/* Profile Section */}
      <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
        <Image
          src={getAvatarUrl(resident.avatar)}
          alt={resident.name}
          width={160}
          height={160}
          className="rounded-full object-cover border-4 border-gray-200 shadow-md"
        />
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {resident.name}
          </h1>
          {resident.nick_name && (
            <p className="text-gray-500 italic mt-1 sm:text-lg">
              ({resident.nick_name})
            </p>
          )}
          <p className="text-gray-600 mt-2 sm:text-lg">
            Class:{" "}
            <span className="font-medium">{resident.class?.name || "N/A"}</span>
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
        {[
          { label: "Date of Birth", value: resident.date_of_birth },
          { label: "Gender", value: resident.gender },
          { label: "Mother's Name", value: resident.Mother_name },
          { label: "Father's Name", value: resident.Father_name },
          { label: "Parents' Address", value: resident.address_parents },
          { label: "Resident Address", value: resident.address_kinds },
          { label: "Contact Number", value: resident.number },
        ].map((field, idx) => (
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
            Comments
          </span>
          <div
            className="p-3 h-40 bg-white border rounded-lg text-gray-700 shadow-sm overflow-auto sm:text-base"
            dangerouslySetInnerHTML={{
              __html: resident.comments || "N/A",
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          onClick={() => window.alert("Go to Medical Records")}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition text-lg sm:text-base"
        >
          Medical Records
        </button>

        <Link href="/dashboard/resident" className="flex-1">
          <button className="w-full px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow hover:bg-gray-300 transition text-lg sm:text-base">
            Back
          </button>
        </Link>
      </div>
    </div>
  );
}
