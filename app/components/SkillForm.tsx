"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { ProgramSkill, ProgramStatus, ResidentField } from "@/app/types";

export default function ResidentSkills({ residentProgramId }: { residentProgramId: string }) {
  const [skills, setSkills] = useState<ProgramSkill[]>([]);
  const [statuses, setStatuses] = useState<ProgramStatus[]>([]);
  const [fields, setFields] = useState<Record<number, ResidentField>>({});

  useEffect(() => {
    apiFetch("/api/program-skills").then((res) => setSkills(res.data || []));
    apiFetch("/api/program-statuses").then((res) => setStatuses(res.data || []));
    apiFetch(`/api/resident-fields?filters[resident_program][id][$eq]=${residentProgramId}`)
      .then((res) => {
        const map: Record<number, ResidentField> = {};
        (res.data || []).forEach((field: any) => {
          map[field.program_skill_id] = field;
        });
        setFields(map);
      });
  }, [residentProgramId]);

  const handleSave = async (skillId: number) => {
    const field = fields[skillId];
    if (!field) return;

    if (field.id) {
      // Update
      await apiFetch(`/api/resident-fields/${field.id}`, {
        method: "PUT",
        body: JSON.stringify(field),
      });
    } else {
      // Create
      const created = await apiFetch("/api/resident-fields", {
        method: "POST",
        body: JSON.stringify(field),
      });
      setFields((prev) => ({
        ...prev,
        [skillId]: { ...field, id: created.id },
      }));
    }
  };

  const handleChange = (skillId: number, key: keyof ResidentField, value: any) => {
    setFields((prev) => ({
      ...prev,
      [skillId]: { ...prev[skillId], program_skill_id: skillId, resident_field_id: +residentProgramId, [key]: value },
    }));
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Program Skills</h2>
      {skills.map((skill) => {
        const field = fields[skill.id] || {
          program_skill_id: skill.id,
          resident_field_id: +residentProgramId,
          status_id: 0,
          comment: "",
          date: "",
        };
        return (
          <div key={skill.id} className="p-4 border rounded-xl bg-white shadow-sm space-y-2">
            <div className="font-medium">{skill.name}</div>

            {/* Status */}
            <select
              className="border rounded-md p-2 w-full"
              value={field.status_id}
              onChange={(e) => handleChange(skill.id, "status_id", Number(e.target.value))}
            >
              <option value={0}>Select status</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Comment */}
            <textarea
              className="border rounded-md p-2 w-full"
              placeholder="Comment"
              value={field.comment}
              onChange={(e) => handleChange(skill.id, "comment", e.target.value)}
            />

            {/* Date */}
            <input
              type="date"
              className="border rounded-md p-2 w-full"
              value={field.date}
              onChange={(e) => handleChange(skill.id, "date", e.target.value)}
            />

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSave(skill.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() =>
                  setFields((prev) => {
                    const updated = { ...prev };
                    delete updated[skill.id];
                    return updated;
                  })
                }
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
