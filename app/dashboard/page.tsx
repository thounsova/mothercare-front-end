"use client";

import { School, User, Users, Home } from "lucide-react";

export default function DashboardPage() {
  const counts = {
    schools: 12,
    teachers: 25,
    parents: 40,
    residents: 60,
  };

  const cards = [
    { label: "Schools", count: counts.schools, icon: <School className="w-10 h-10 text-blue-700" />, bg: "bg-blue-100" },
    { label: "Teachers", count: counts.teachers, icon: <User className="w-10 h-10 text-green-700" />, bg: "bg-green-100" },
    { label: "Parents", count: counts.parents, icon: <Users className="w-10 h-10 text-yellow-700" />, bg: "bg-yellow-100" },
    { label: "Residents", count: counts.residents, icon: <Home className="w-10 h-10 text-purple-700" />, bg: "bg-purple-100" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">

      <div className="flex flex-wrap gap-6 mt-4 justify-center">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} flex-1 min-w-[180px] max-w-[250px] p-6 rounded-lg shadow flex flex-col items-center gap-2`}
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
