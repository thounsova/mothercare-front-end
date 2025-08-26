"use client";

import { useEffect, useState } from "react";
import { School, User, Users, Home } from "lucide-react";

const baseURL = "https://energized-fireworks-cc618580b1.strapiapp.com";

export default function DashboardPage() {
  const [counts, setCounts] = useState({
    branches: 0,
    teachers: 0,
    parents: 0,
    residents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch residents
        const residentsRes = await fetch(`${baseURL}/api/profile-residents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const residentsData = await residentsRes.json();

        // Fetch branches
        const branchesRes = await fetch(`${baseURL}/api/branches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const branchesData = await branchesRes.json();

        // Fetch teachers
        const teachersRes = await fetch(`${baseURL}/api/teachers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const teachersData = await teachersRes.json();

        // Fetch parents
        const parentsRes = await fetch(`${baseURL}/api/parents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const parentsData = await parentsRes.json();

        setCounts({
          residents: residentsData.data?.length || 0,
          branches: branchesData.data?.length || 0,
          teachers: teachersData.data?.length || 0,
          parents: parentsData.data?.length || 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard counts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  const cards = [
    {
      label: "Branches",
      count: counts.branches,
      icon: <School className="w-10 h-10 text-blue-700" />,
      bg: "bg-blue-100",
    },
    {
      label: "Teachers",
      count: counts.teachers,
      icon: <User className="w-10 h-10 text-green-700" />,
      bg: "bg-green-100",
    },
    {
      label: "Parents",
      count: counts.parents,
      icon: <Users className="w-10 h-10 text-yellow-700" />,
      bg: "bg-yellow-100",
    },
    {
      label: "Residents",
      count: counts.residents,
      icon: <Home className="w-10 h-10 text-purple-700" />,
      bg: "bg-purple-100",
    },
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[300px] text-gray-500">
        Loading dashboard...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-wrap gap-6 mt-4 justify-center">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} flex-1 min-w-[180px] max-w-[250px] p-6 rounded-lg shadow flex flex-col items-center gap-2 hover:shadow-lg transition`}
          >
            {card.icon}
            <p className="text-2xl font-bold">{card.count}</p>
            <p className="text-gray-700 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
