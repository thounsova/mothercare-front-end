"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const baseURL = "http://localhost:1337"; // your Strapi API

export default function SkillsPage() {
  const params = useParams();
  const { id } = params as { id?: string };
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchSkills = async () => {
      try {
        const res = await fetch(
          `${baseURL}/api/assessments/${id}?populate=skills`
        );
        const data = await res.json();
        // take skills from response
        const skillList = data.data.attributes.skills.data;
        setSkills(skillList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [id]);

  if (loading) return <p>Loading skills...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Skills</h1>
      {skills.length > 0 ? (
        <ul>
          {skills.map((s) => (
            <li key={s.id}>
              <strong>{s.attributes.name}</strong> –{" "}
              {s.attributes.description || "No description"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No skills found</p>
      )}
    </div>
  );
}