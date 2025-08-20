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
    <div className="min-h-screen  bg-gray-70">
      <div className="w-full max-w-3xl p-6">
        {/* Filter and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <select className="border px-3 py-2 rounded w-full md:w-auto">
            <option>Level / Class</option>
          </select>

          <input
            type="text"
            placeholder="Search here..."
            className="border px-4 py-2 rounded w-full md:w-64"
          />
        </div>

        {/* Residents */}
        <div className="space-y-3">
          {residents.map((resident) => (
            <div
              key={resident.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between bg-blue-600 text-white p-4 rounded-lg "
            >
              <div className="flex items-cnter gap-4">
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

              <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#ddeafff1] text-black text-[15px]">
                👁️ VIEW
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-8 gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded bg-[#477dcf] disabled:opacity-50 text-white font-semibold"
          >
            Previous
          </button>
          <span className="text-[#0077FF] font-semibold">
            Page <strong>{page}</strong> of {totalPages}
          </span>
          <button
            className="px-4 py-2 rounded bg-blue-500 text-white font-semibold"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
