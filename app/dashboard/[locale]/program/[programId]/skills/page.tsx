"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import EvaluationSliders from "@/app/components/EvaluationSliders";

const baseURL = "http://localhost:1337";

export default function ProgramSkillsPage() {
  const router = useRouter();
  const { locale, programId } = useParams(); // programId = documentId

  const [loading, setLoading] = useState(true);

  // You can still fetch data if needed, but the UI will be different.
  const fetchProgramData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      
      // Example of a fetch call, though not used in the UI
      const res = await fetch(
        `${baseURL}/api/programs/${programId}?populate=program_skills`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch program data");

    } catch (err) {
      console.error("Error fetching program data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramData();
  }, [programId]);

  if (loading)
    return (
      <p className="p-6 text-center">
        {locale === "en" ? "Loading..." : "កំពុងផ្ទុក..."}
      </p>
    );

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="w-full max-w-4xl p-4 md:p-6 mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {locale === "en" ? "Program Evaluation" : "ការវាយតម្លៃកម្មវិធី"}
        </h1>

        <EvaluationSliders />

      </div>
    </div>
  );
}