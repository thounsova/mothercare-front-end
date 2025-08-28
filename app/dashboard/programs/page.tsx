"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Eye } from "lucide-react";
import Good from "@/app/img/good.jpg";
import Medium from "@/app/img/medium.jpg";
import Low from "@/app/img/low.jpg";
import Question from "@/app/img/question.png";

const BASEURL = "https://energized-fireworks-cc618580b1.strapiapp.com";

// ----- Types -----
interface Avatar { url?: string; formats?: { thumbnail?: { url: string }; small?: { url: string } }; }
interface Class { id: number; name: string; }
interface ParentUser { id: number; username: string; email: string; }
interface EducatorUser { id: number; username: string; email: string; }
interface Resident { id: number; documentId: string; locale: string; full_name: string; nick_name?: string; gender?: string; country: string; avatar?: Avatar | null; class?: Class | null; parent_users: ParentUser[]; educator_user: EducatorUser | null; }
interface Pagination { page: number; pageSize: number; pageCount: number; total: number; }
interface ApiResidentResponse { data: Resident[]; }
interface ApiProgramSkill { documentId: string; name: string; }
interface ApiProgramItem { program_skills?: ApiProgramSkill[]; }
interface ApiProgramResponse { data?: ApiProgramItem[]; }
interface KidField { kidFieldId?: string; programSkillId: string; programSkillName: string; programStatusId?: string; comments?: string; }

// ----- Helpers -----
const getAvatarUrl = (avatar?: Avatar | null) => {
  if (!avatar) return "/default-avatar.png";
  const url = avatar.formats?.thumbnail?.url || avatar.formats?.small?.url || avatar.url || "";
  return url.startsWith("http") ? url : BASEURL + url;
};
function mapToProgramSkills(res: ApiProgramResponse) {
  const items = res.data ?? [];
  return items.flatMap((item) =>
    (item.program_skills ?? []).map((s) => ({
      programSkillId: s.documentId?.trim() ?? "",
      programSkillName: s.name?.trim() ?? "",
    }))
  );
}

// ----- ResidentList Component -----
export default function ResidentList() {
  const router = useRouter();
  const params = useParams();
  const [locale, setLocale] = useState<"en" | "km">((params.locale as "en" | "km") || "en");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 6, pageCount: 1, total: 0 });
  
  const [openModalResidentId, setOpenModalResidentId] = useState<string | null>(null);
  const [programSkills, setProgramSkills] = useState<KidField[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const getToken = () => localStorage.getItem("token");

  // ----- Fetch residents -----
  const fetchResidents = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const loggedUserJson = localStorage.getItem("user");
      if (!token || !loggedUserJson) { router.push("/login"); return; }
      const loggedUser = JSON.parse(loggedUserJson);
      const role = loggedUser.role?.type;
      const branchId = loggedUser.branch?.documentId;
      const userId = loggedUser.documentId;

      let url = `${BASEURL}/api/profile-residents?populate=avatar&populate=class&filters[branch][documentId][$eq]=${branchId}`;
      if (role === "educator") url = `${BASEURL}/api/profile-residents?populate=avatar&populate=class&populate=educator_user&filters[educator_user][documentId][$eq]=${userId}`;
      if (role === "parent") url = `${BASEURL}/api/profile-residents?populate=avatar&populate=class&populate=parent_user&filters[parent_user][documentId][$eq]=${userId}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) { localStorage.clear(); router.push("/login"); return; }

      const data: ApiResidentResponse = await res.json();
      setResidents(data.data); setFilteredResidents(data.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };
  useEffect(() => { fetchResidents(); }, []);
  
  useEffect(() => {
    let filtered = residents;
    if (selectedClass !== "All") filtered = filtered.filter((r) => r.class?.name === selectedClass);
    if (searchTerm) filtered = filtered.filter((r) => r.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredResidents(filtered);
  }, [residents, selectedClass, searchTerm]);

  useEffect(() => {
    setPagination((p) => ({
      ...p,
      pageCount: Math.ceil(filteredResidents.length / p.pageSize) || 1,
      total: filteredResidents.length,
      page: Math.min(p.page, Math.ceil(filteredResidents.length / p.pageSize) || 1),
    }));
  }, [filteredResidents]);

  // ----- Fetch program skills for modal -----
  useEffect(() => {
    if (!openModalResidentId) return;
    const fetchSkills = async () => {
      const token = getToken();
      if (!token) return;
      setModalLoading(true);
      try {
        const res = await fetch(`${BASEURL}/api/resident-programs?filters[kid_profile][documentId][$eq]=${openModalResidentId}&populate=program_skills`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: ApiProgramResponse = await res.json();
        setProgramSkills(mapToProgramSkills(data));
      } catch (err) { console.error(err); } 
      finally { setModalLoading(false); }
    };
    fetchSkills();
  }, [openModalResidentId]);

  const handleSave = async (skill: KidField, data: { status?: string; comments?: string }) => {
    const token = getToken(); if (!token) return;
    const payload = { data: { activity_date: new Date().toISOString().slice(0,10), program_status: data.status, comments: data.comments, validated_by: "Educator", program_skill: skill.programSkillId, kid_profile: openModalResidentId } };
    try {
      const res = await fetch(`${BASEURL}/api/resident-fields`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const saved = await res.json();
      alert("Saved");
    } catch (err) { console.error(err); alert("Failed"); }
  };

  if (loading) return <p className="p-6 text-center text-gray-500">Loading residents...</p>;

  const paginatedResidents = filteredResidents.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);
  const classOptions = Array.from(new Set(residents.map((r) => r.class?.name).filter((n): n is string => !!n)));

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder={locale === "en" ? "Search here..." : "ស្វែងរក..."}
            className="border px-4 py-2 w-full sm:w-64 rounded-lg shadow-sm focus:outline-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border px-4 py-2 w-full sm:w-48 rounded-lg shadow-sm focus:outline-blue-500"
          >
            <option value="All">{locale === "en" ? "All Classes" : "គ្រប់ថ្នាក់"}</option>
            {classOptions.map((cls, idx) => <option key={idx} value={cls}>{cls}</option>)}
          </select>
        </div>

        {/* Residents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedResidents.map((resident) => (
            <div key={resident.id} className="flex flex-col justify-between border-2 border-blue-300 rounded-xl shadow-sm bg-white p-4 hover:shadow-lg transition">
              <div className="flex items-center gap-4 mb-3">
                <Image src={getAvatarUrl(resident.avatar)} alt={resident.full_name} width={70} height={70} className="rounded-full border-2 border-blue-400"/>
                <div className="flex flex-col">
                  <p className="font-semibold text-black text-lg">{resident.full_name}</p>
                  {resident.nick_name && <p className="text-gray-500 italic text-sm">({resident.nick_name})</p>}
                  <p className="text-gray-400 italic text-sm">{resident.class?.name || (locale === "en" ? "No Class" : "គ្មានថ្នាក់")}</p>
                </div>
              </div>
              <button
                onClick={() => setOpenModalResidentId(resident.documentId)}
                className="mt-auto bg-blue-600 text-white rounded-lg py-2 w-full flex items-center justify-center gap-2 hover:bg-blue-700 transition font-medium"
              >
                <Eye size={18} /> {locale === "en" ? "View Program" : "មើលកម្មវិធី"}
              </button>
            </div>
          ))}
        </div>

        {/* Modal */}
        {openModalResidentId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-3xl max-h-[80vh] overflow-auto rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Program Skills</h2>
                <button className="text-xl text-gray-500 font-bold" onClick={() => setOpenModalResidentId(null)}>✕</button>
              </div>
              {modalLoading ? (
                <p className="text-gray-500 text-center">Loading...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programSkills.map((skill) => (
                    <SkillRow key={skill.programSkillId} skill={skill} onSave={handleSave}/>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ----- SkillRow Component -----
function SkillRow({
  skill,
  onSave,
}: {
  skill: KidField;
  onSave: (skill: KidField, data: { status?: string; comments?: string }) => void;
}) {
  const [status, setStatus] = useState("");
  const [comments, setComments] = useState("");
  const [busy, setBusy] = useState(false);

  // Options with images
  const options = [
    { id: "ulx5u0guqb1darlr0091t60k", label: "Good", img: Good },
    { id: "k530zojlwzjstmtvsyzb3eiu", label: "Medium", img: Medium },
    { id: "gvw2gb4la9idqrxplm424xjs", label: "Low", img: Low },
    { id: "zj9fr3ijbnvmzqvyaonujca6", label: "?", img: Question },
  ];

  const save = async () => {
    setBusy(true);
    await onSave(skill, {
      status: status || undefined,
      comments: comments || undefined,
    });
    setBusy(false);
  };

  return (
    <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition flex flex-col">
      <h3 className="text-lg font-semibold mb-3">{skill.programSkillName}</h3>

      {/* Status Options */}
      <div className="flex flex-wrap gap-3 mb-3 items-center">
        {options.map((o) => (
          <label
            key={o.id}
            className={`inline-flex items-center gap-2 cursor-pointer border px-3 py-2 rounded-lg transition ${
              status === o.id ? "bg-blue-50 border-blue-400" : "hover:bg-gray-100"
            }`}
          >
            <input
              type="radio"
              name={`status-${skill.programSkillId}`}
              value={o.id}
              checked={status === o.id}
              onChange={(e) => setStatus(e.target.value)}
              className="h-4 w-4"
            />
            <Image
              src={o.img}
              alt={o.label}
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="text-sm font-medium">{o.label}</span>
          </label>
        ))}
        <button
          type="button"
          className="text-xs text-gray-500 underline ml-2"
          onClick={() => setStatus("")}
        >
          Clear
        </button>
      </div>

      {/* Comments */}
      <textarea
        className="border w-full p-2 rounded mb-3 resize-none text-sm"
        placeholder="Write comments here..."
        rows={3}
        value={comments}
        onChange={(e) => setComments(e.target.value)}
      />

      {/* Save Button */}
      <button
        onClick={save}
        disabled={busy}
        className="mt-auto bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

// ----------------- Parent Component -----------------
