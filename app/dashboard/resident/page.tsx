"use client";

import { useState } from "react";
import Image from "next/image";

interface Resident {
  id: number;
  name: string;
  age: number;
  avatar: string;
}

const residents: Resident[] = [
  { id: 1, name: "Joshua Ashiru", age: 6, avatar: "/avatar1.jpg" },
  { id: 2, name: "Joshua Ashiru", age: 6, avatar: "/avatar2.jpg" },
  { id: 3, name: "Joshua Ashiru", age: 6, avatar: "/avatar3.jpg" },
  { id: 4, name: "Joshua Ashiru", age: 6, avatar: "/avatar4.jpg" },
];

export default function ResidentList() {
  const [page, setPage] = useState(1);
  const totalPages = 10;

  return (
    <div className="max-w-full bg-gray-100 p-6 flex flex-col gap-6">
      {/* Filter and Search */}
      <div className="flex justify-between items-center mb-6">
        <select className="border px-3 py-2 rounded">
          <option>Level / Class</option>
          <option>Class 1</option>
          <option>Class 2</option>
        </select>

        <input
          type="text"
          placeholder="Search here..."
          className="border px-4 py-2 rounded w-64"
        />
      </div>

      {/* Residents */}
      <div className="space-y-4">
        {residents.map((resident) => (
          <div
            key={resident.id}
            className="flex items-center justify-between bg-blue-600 text-white p-4 rounded-xl shadow"
          >
            <div className="flex items-center gap-4">
              <Image
                src={resident.avatar}
                alt={resident.name}
                width={50}
                height={50}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold text-[23px]">{resident.name}</p>
                <p className="text-sm font-semibold">{resident.age} YEARS</p>
              </div>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#DDEAFF] text-black ">
              👁️ VIEWS
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-8 gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 rounded bg-blue-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page <strong>{page}</strong> of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded bg-blue-500 text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
}
