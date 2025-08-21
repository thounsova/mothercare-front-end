"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const baseURL = "http://localhost:1337";

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
  className?: string;
}

export default function ResidentProfile() {
  const params = useParams();
  const documentId = params.id;

  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResident() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return (window.location.href = "/login");

        const res = await fetch(
          "http://localhost:1337/api/classes?populate[profile_residents][populate]=avatar",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          return (window.location.href = "/login");
        }

        const data = await res.json();

        const allResidents: Resident[] = data.data.flatMap((cls: any) =>
          (cls.profile_residents || []).map((r: any) => ({
            ...r,
            className: cls.name,
          }))
        );

        const foundResident = allResidents.find((r) => r.documentId === documentId);
        setResident(foundResident || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchResident();
  }, [documentId]);

  if (loading) return <p className="p-6 text-center">Loading profile...</p>;
  if (!resident) return <p className="p-6 text-center">Resident not found.</p>;

  // Handler for Clear button


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        <Image
          src={getAvatarUrl(resident.avatar)}
          alt={resident.name}
          width={120}
          height={120}
          className="rounded-full object-cover border-2 border-gray-300 p-1"
        />
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{resident.name}</h1>
          {resident.nick_name && (
            <p className="text-gray-500 italic mt-1">({resident.nick_name})</p>
          )}
          <p className="text-gray-600 mt-2">Class: {resident.className || "N/A"}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        {/* Date of Birth */}
        <div className="flex flex-col">
          <label className="text-gray-500 font-medium mb-1">Date of Birth</label>
          <p className="p-2 border rounded text-gray-700">{resident.date_of_birth || "N/A"}</p>
        </div>
        {/* Gender */}
        <div className="flex flex-col">
          <label className="text-gray-500 font-medium mb-1">Gender</label>
          <p className="p-2 border rounded text-gray-700">{resident.gender || "N/A"}</p>
        </div>
        {/* Mother's Name */}
        <div className="flex flex-col">
          <label className="text-gray-500 font-medium mb-1">Mother's Name</label>
          <p className="p-2 border rounded text-gray-700">{resident.Mother_name || "N/A"}</p>
        </div>
        {/* Father's Name */}
        <div className="flex flex-col">
          <label className="text-gray-500 font-medium mb-1">Father's Name</label>
          <p className="p-2 border rounded text-gray-700">{resident.Father_name || "N/A"}</p>
        </div>
        {/* Parents' Address */}
        <div className="flex flex-col">
          <label className="text-gray-500 font-medium mb-1">Parents' Address</label>
          <p className="p-2 border rounded text-gray-700">{resident.address_parents || "N/A"}</p>
        </div>
        {/* Resident Address */}
        <div className="flex flex-col">
          <label className="text-gray-500 font-medium mb-1">Resident Address</label>
          <p className="p-2 border rounded text-gray-700">{resident.address_kinds || "N/A"}</p>
        </div>
        {/* Contact Number */}
        <div className="flex flex-col sm:col-span-2">
          <label className="text-gray-500 font-medium mb-1">Contact Number</label>
          <p className="p-2 border rounded text-gray-700">{resident.number || "N/A"}</p>
        </div>
        {/* Comments */}
        <div className="flex flex-col sm:col-span-2">
          <label className="text-gray-500 font-medium mb-1">Comments</label>
          <div
            className="p-2 h-40 border rounded text-gray-700 overflow-auto"
            dangerouslySetInnerHTML={{ __html: resident.comments || "N/A" }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 sm:col-span-2 mt-2">
          <button
            onClick={() => window.alert("Go to Medical Records")}
            className="flex-1 px-6  py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
          >
            Medical
          </button>
          <Link href="/dashboard/resident" className="flex-1">
  <button className="w-full px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow hover:bg-gray-400 transition">
    Clear
  </button>
</Link>
        </div>
      </div>
    </div>
  );
}
