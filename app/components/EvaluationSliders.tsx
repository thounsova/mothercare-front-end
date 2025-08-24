"use client";

import { useState, useEffect } from "react";
import Slider from "./Slider";
import { FiCheck } from "react-icons/fi";

interface ProgramSkill {
  id: number;
  name: string;
  score?: number;
  comments?: string | null;
}

interface ProgramStatus {
  id: number;
  score: number;
  comments?: string;
  program_skill?: { id: number };
}

interface SliderState {
  [key: string]: { value: number; comments: string; statusId?: number; skillId: number };
}

export default function EvaluationSliders() {
  const [skills, setSkills] = useState<ProgramSkill[]>([]);
  const [sliderStates, setSliderStates] = useState<SliderState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const skillURL = "http://localhost:1337/api/program-skills";
  const statusURL = "http://localhost:1337/api/program-statuses?populate=program_skill";

  // Fetch skills and statuses from Strapi
  const fetchSkills = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (!token) throw new Error("No token found in localStorage.");

      // Fetch skills
      const skillRes = await fetch(skillURL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!skillRes.ok) throw new Error("Failed to fetch program skills");
      const skillJson = await skillRes.json();
      const skillsData: ProgramSkill[] = skillJson.data;

      // Fetch existing statuses
      const statusRes = await fetch(statusURL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!statusRes.ok) throw new Error("Failed to fetch program statuses");
      const statusJson = await statusRes.json();
      const statuses: ProgramStatus[] = statusJson.data;

      // Initialize slider states
      const initialStates: SliderState = {};
      skillsData.forEach((skill) => {
        const status = statuses.find(
          (s) => s.program_skill?.id === skill.id
        );
        initialStates[skill.name] = {
          value: status?.score || skill.score || 0,
          comments: status?.comments || skill.comments || "",
          statusId: status?.id,
          skillId: skill.id,
        };
      });

      setSkills(skillsData);
      setSliderStates(initialStates);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [token]);

  // Update UI immediately
  const handleValueChange = (name: string, value: number) => {
    setSliderStates((prev) => ({
      ...prev,
      [name]: { ...prev[name], value },
    }));
  };

  const handleCommentsChange = (name: string, comments: string) => {
    setSliderStates((prev) => ({
      ...prev,
      [name]: { ...prev[name], comments },
    }));
  };

  // Save or update each skill status
  const commitScores = async () => {
    if (!token) {
      alert("No token found.");
      return;
    }

    setSaving(true);

    try {
      await Promise.all(
        Object.entries(sliderStates).map(async ([name, state]) => {
          const isUpdate = !!state.statusId;
          const url = isUpdate
            ? `http://localhost:1337/api/program-statuses/${state.statusId}`
            : "http://localhost:1337/api/program-statuses";

          const body = isUpdate
            ? { data: { score: state.value, comments: state.comments } }
            : {
                data: {
                  score: state.value,
                  comments: state.comments,
                  program_skill: state.skillId, // required for relation
                },
              };

          const res = await fetch(url, {
            method: isUpdate ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Failed to save ${name}: ${res.status} ${text}`);
          } else {
            // Update the UI immediately with returned ID for new items
            const json = await res.json();
            if (!isUpdate && json.data?.id) {
              setSliderStates((prev) => ({
                ...prev,
                [name]: { ...prev[name], statusId: json.data.id },
              }));
            }
          }
        })
      );

      alert("Scores and comments saved successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (errorMsg) return <p className="text-red-500">Error: {errorMsg}</p>;
  if (skills.length === 0) return <p>No skills found in Strapi.</p>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="space-y-6">
        {skills.map((skill) => (
          <div key={skill.id} className="border-b pb-4">
            <div className="font-semibold text-lg text-gray-700 mb-2">{skill.name}</div>
            <div className="flex items-center gap-4 mb-2">
              <Slider
                color="from-green-400 to-green-600"
                value={sliderStates[skill.name]?.value || 0}
                onChange={(e) =>
                  handleValueChange(skill.name, parseInt(e.target.value))
                }
              />
              <span className="w-10 text-right font-bold text-gray-600">
                {sliderStates[skill.name]?.value || 0}%
              </span>
            </div>
            <textarea
              className="p-3 w-full h-24 bg-white border rounded-lg text-gray-700 shadow-sm resize-none"
              value={sliderStates[skill.name]?.comments || ""}
              onChange={(e) => handleCommentsChange(skill.name, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end items-center gap-4 mt-8">
        <button
          disabled={saving}
          onClick={commitScores}
          className={`flex items-center justify-center p-3 rounded-full text-white transition ${
            saving ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          <FiCheck size={20} />
          {saving && <span className="ml-2">Saving...</span>}
        </button>
      </div>
    </div>
  );
}
