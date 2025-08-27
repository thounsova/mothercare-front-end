"use client";

import React, { useEffect, useState } from "react";
import ProgramStatus from "@/app/components/ProgramStatusSelect";

const baseURL = "https://energized-fireworks-cc618580b1.strapiapp.com";

interface FullPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  kidDocumentId: string;
}

// Skill shape used inside component state
interface KidSkill {
  id: number;
  name: string;
  programStatusId?: string;
  comments?: string;
  score?: number;
}

// Strapi response types
interface ProgramSkillResponse {
  id: number;
  name: string;
  programStatusId?: string;
  comments?: string;
  score?: number;
}

interface ResidentProgramResponse {
  id: number;
  program_skills: ProgramSkillResponse[];
}

export const FullPageModal: React.FC<FullPageModalProps> = ({
  isOpen,
  onClose,
  kidDocumentId,
}) => {
  const [skills, setSkills] = useState<KidSkill[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !kidDocumentId) return;

    const fetchProgramSkills = async () => {
      setLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found in localStorage");

        const res = await fetch(
          `${baseURL}/api/resident-programs?filters[kid_profile][documentId][$eq]=${kidDocumentId}&populate=program_skills`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch program skills");

        const data: { data: ResidentProgramResponse[] } = await res.json();

        const resident = data.data?.[0];

        const skillsData: KidSkill[] =
          resident?.program_skills?.map((item) => ({
            id: item.id,
            name: item.name,
            programStatusId: item.programStatusId,
            comments: item.comments,
            score: item.score,
          })) || [];

        setSkills(skillsData);
      } catch (error) {
        console.error("Error fetching program skills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramSkills();
  }, [isOpen, kidDocumentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full h-full sm:h-[90vh] sm:w-[90vw] rounded-none sm:rounded-2xl shadow-lg overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl sm:text-2xl font-bold text-black">
            Full Page Modal: {kidDocumentId}
          </h2>
          <button
            className="text-gray-500 hover:text-red-600 text-2xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Body with Form */}
        <div className="p-6 space-y-4">
          {loading ? (
            <p className="text-gray-500">Loading skills...</p>
          ) : skills.length === 0 ? (
            <p className="text-gray-500">No skills found for this kid.</p>
          ) : (
            skills.map((skill) => (
              <form
                key={skill.id}
                className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition"
              >
                {/* Skill Name */}
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Skill
                  </label>
                  <input
                    type="text"
                    value={skill.name}
                    readOnly
                    className="w-full border text-black rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Status */}
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Status
                  </label>
                  <ProgramStatus
                    value={skill.programStatusId}
                    className="text-sm text-black"
                  />
                </div>

                {/* Comment */}
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Comment
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter comment"
                    className="w-full border text-black rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    defaultValue={skill.comments}
                  />
                </div>

                {/* Save Button */}
                <div className="flex-shrink-0 mt-2 md:mt-0">
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm transition"
                  >
                    Save
                  </button>
                </div>
              </form>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
