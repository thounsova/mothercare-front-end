"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FiCheck, FiActivity, FiSmile, FiMeh, FiFrown } from "react-icons/fi";
import Slider from "./Slider";

const baseURL = "http://localhost:1337";

interface Skill {
  id: number;
  name: string;
}

interface Status {
  id?: number;
  score: number;
  comments?: string;
  skillId: number;
  documentId?: string;
}

interface SliderState {
  [key: string]: Status & { saving?: boolean };
}

export default function ProgramEvaluation() {
  const { residentId, programId } = useParams();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [sliderStates, setSliderStates] = useState<SliderState>({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchSkillsAndStatuses = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // fetch skills
      const skillRes = await fetch(`${baseURL}/api/program-skills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const skillJson = await skillRes.json();
      const skillsData: Skill[] = skillJson.data.map((s: any) => ({
        id: s.id,
        name: s.attributes.name,
      }));

      // fetch existing statuses
      const statusRes = await fetch(
        `${baseURL}/api/program-statuses?filters[program][id][$eq]=${programId}&filters[resident][documentId][$eq]=${residentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const statusJson = await statusRes.json();
      const statuses: Status[] = statusJson.data.map((s: any) => ({
        score: s.attributes.score,
        comments: s.attributes.comments,
        skillId: s.attributes.program_skill.data.id,
        documentId: s.id.toString(),
      }));

      const initialStates: SliderState = {};
      skillsData.forEach((skill) => {
        const status = statuses.find((s) => s.skillId === skill.id);
        initialStates[skill.name] = {
          score: status?.score || 0,
          comments: status?.comments || "",
          skillId: skill.id,
          documentId: status?.documentId,
          saving: false,
        };
      });

      setSkills(skillsData);
      setSliderStates(initialStates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSkillsAndStatuses(); }, [residentId, programId]);

  const handleChange = (name: string, value: number) =>
    setSliderStates((prev) => ({ ...prev, [name]: { ...prev[name], score: value } }));
  const handleCommentsChange = (name: string, comments: string) =>
    setSliderStates((prev) => ({ ...prev, [name]: { ...prev[name], comments } }));

  const saveStatus = async (name: string) => {
    if (!token) return;
    const state = sliderStates[name];
    setSliderStates((prev) => ({ ...prev, [name]: { ...prev[name], saving: true } }));

    try {
      const isUpdate = !!state.documentId;
      const url = isUpdate
        ? `${baseURL}/api/program-statuses/${state.documentId}`
        : `${baseURL}/api/program-statuses`;

      const body = {
        data: {
          score: state.score,
          comments: state.comments,
          program_skill: state.skillId,
          program: programId,
          resident: residentId,
        },
      };

      const res = await fetch(url, {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(json));

      if (!isUpdate && json.data?.id) {
        setSliderStates((prev) => ({
          ...prev,
          [name]: { ...prev[name], documentId: json.data.id.toString() },
        }));
      }
      alert(`${name} saved successfully!`);
    } catch (err: any) {
      alert(`Failed to save ${name}: ${err.message}`);
    } finally {
      setSliderStates((prev) => ({ ...prev, [name]: { ...prev[name], saving: false } }));
    }
  };

  if (loading) return <p className="p-6 text-center">Loading skills...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 bg-white shadow-lg rounded-lg">
      {skills.map((skill) => (
        <div key={skill.id} className="border-b pb-4">
          <div className="flex items-center gap-3 mb-2">
            <FiActivity className="text-green-500 text-xl" />
            <h3 className="font-semibold">{skill.name}</h3>
          </div>

          <div className="flex gap-3 mb-2">
            {[0, 50, 100].map((val) => (
              <button
                key={val}
                onClick={() => handleChange(skill.name, val)}
                className={`px-3 py-1 rounded-lg border ${
                  sliderStates[skill.name]?.score === val
                    ? "bg-blue-100 border-blue-400"
                    : "hover:bg-gray-100"
                }`}
              >
                {val}%
              </button>
            ))}
          </div>

          <Slider
            color="from-green-400 to-green-600"
            value={sliderStates[skill.name]?.score || 0}
            onChange={(e) => handleChange(skill.name, parseInt(e.target.value))}
          />

          <textarea
            className="w-full p-2 mt-2 border rounded-lg"
            placeholder="Add comments..."
            value={sliderStates[skill.name]?.comments || ""}
            onChange={(e) => handleCommentsChange(skill.name, e.target.value)}
          />

          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            disabled={sliderStates[skill.name]?.saving}
            onClick={() => saveStatus(skill.name)}
          >
            {sliderStates[skill.name]?.saving ? "Saving..." : sliderStates[skill.name]?.documentId ? "Update" : "Save"}
          </button>
        </div>
      ))}
    </div>
  );
}
