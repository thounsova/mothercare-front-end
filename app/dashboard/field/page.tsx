"use client";
import { useEffect, useState } from "react";

interface Program {
  id: number;
  activity_name: string;
}

export default function ProgramList({ onSelectProgram }: { onSelectProgram: (program: Program) => void }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  
  useEffect(() => {
    const fetchPrograms = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("https://energized-fireworks-cc618580b1.strapiapp.com/api/programs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPrograms(data.data);
    };
    fetchPrograms();
  }, []);

  return (
    <div>
      <h2>Programs</h2>
      <ul>
        {programs.map(p => (
          <li key={p.id}>
            <button onClick={() => onSelectProgram(p)}>{p.activity_name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
