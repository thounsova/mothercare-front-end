"use client";

import { useEffect, useState } from "react";

const BASEURL = "https://energized-fireworks-cc618580b1.strapiapp.com";

interface KidField {
  kidFieldId?: string;
  programSkillId: string;
  programSkillName: string;
  programStatusId?: string;
  comments?: string;
  score?: number;
}

interface ProgramSkill {
  programSkillId: string;
  programSkillName: string;
}

interface ApiProgramSkill {
  documentId: string;
  name: string;
}

interface ApiDataItem {
  program_skills?: ApiProgramSkill[];
}

interface ApiResponse {
  data?: ApiDataItem[];
}

function mapToProgramSkills(res: ApiResponse): ProgramSkill[] {
  const items = res.data ?? [];
  return items.flatMap((item) =>
    (item.program_skills ?? []).map((s) => ({
      programSkillId: s.documentId?.trim() ?? "",
      programSkillName: s.name?.trim() ?? "",
    }))
  );
}

interface FullPageModalProps {
  kidDocumentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FullPageModal({ kidDocumentId, isOpen, onClose }: FullPageModalProps) {
  const [programSkills, setProgramSkills] = useState<ProgramSkill[]>([]);
  const [kidFields, setKidFields] = useState<KidField[]>([]);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const getToken = () => localStorage.getItem("educator_token");

  useEffect(() => {
    if (!isOpen) return;

    const fetchSkills = async () => {
      const token = getToken();
      if (!token) return;

      setLoading(true);
      try {
        const res = await fetch(
          `${BASEURL}/api/resident-programs?filters[kid_profile][documentId][$eq]=${kidDocumentId}&populate=program_skills`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data: ApiResponse = await res.json();
        const skills = mapToProgramSkills(data);
        setProgramSkills(skills);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [isOpen, kidDocumentId]);

  const getExisting = (skillId: string) => kidFields.find((f) => f.programSkillId === skillId);

  const handleSave = async (skill: ProgramSkill, data: { status?: string; comments?: string }) => {
    const token = getToken();
    if (!token) {
      alert("No token found, login required");
      return;
    }

    const payload = {
      data: {
        activity_date: today,
        comments: data.comments,
        program_status: data.status,
        validated_by: "Educator",
        program_skill: skill.programSkillId,
        kid_profile: kidDocumentId,
      },
    };

    try {
      const existing = getExisting(skill.programSkillId);
      const res = await fetch(`${BASEURL}/api/resident-fields`, {
        method: existing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();
      setKidFields((prev) => {
        const idx = prev.findIndex((f) => f.programSkillId === skill.programSkillId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...saved };
          return copy;
        }
        return [...prev, saved];
      });
      alert(existing ? "Updated" : "Saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[80vh] overflow-auto rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Program Skills — {today}</h2>
          <button className="text-xl text-gray-500 font-bold" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programSkills.map((skill) => (
              <SkillRow
                key={skill.programSkillId}
                skill={skill}
                existing={getExisting(skill.programSkillId)}
                onSave={(data) => handleSave(skill, data)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SkillRow({
  skill,
  existing,
  onSave,
}: {
  skill: ProgramSkill;
  existing?: KidField;
  onSave: (data: { status?: string; comments?: string }) => void;
}) {
  const [status, setStatus] = useState(existing?.programStatusId || "");
  const [comments, setComments] = useState(existing?.comments || "");
  const [busy, setBusy] = useState(false);

  const options = [
    { id: "ulx5u0guqb1darlr0091t60k", label: "Good" },
    { id: "k530zojlwzjstmtvsyzb3eiu", label: "Medium" },
    { id: "gvw2gb4la9idqrxplm424xjs", label: "Low" },
    { id: "zj9fr3ijbnvmzqvyaonujca6", label: "?" },
  ];

  const save = async () => {
    setBusy(true);
    await onSave({ status: status || undefined, comments: comments || undefined });
    setBusy(false);
  };

  return (
    <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-semibold mb-2">{skill.programSkillName}</h3>
      <div className="flex flex-wrap gap-3 mb-2 items-center">
        {options.map((o) => (
          <label key={o.id} className="inline-flex items-center gap-2">
            <input
              type="radio"
              name={`status-${skill.programSkillId}`}
              value={o.id}
              checked={status === o.id}
              onChange={(e) => setStatus(e.target.value)}
              className="h-4 w-4"
            />
            <span>{o.label}</span>
          </label>
        ))}
        <button type="button" className="text-xs text-gray-500 underline ml-2" onClick={() => setStatus("")}>
          Clear
        </button>
      </div>

      <textarea
        className="border w-full p-2 rounded mb-2"
        placeholder="Comments"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
      />

      <button
        onClick={save}
        disabled={busy}
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
      >
        {existing ? (busy ? "Updating…" : "Update") : busy ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
