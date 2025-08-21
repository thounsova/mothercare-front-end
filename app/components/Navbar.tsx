"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

const baseURL = "http://localhost:1337"; // Strapi API URL

export default function Navbar() {
  const [language, setLanguage] = useState<"EN" | "KM">("EN");
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "EN" ? "KM" : "EN"));
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); // JWT stored from login
        if (!token) return;

        const res = await fetch(`${baseURL}/api/users/me?populate=*`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("❌ Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-white shadow">
      {/* Title */}
      <h1 className="text-xl font-semibold">
        {language === "EN" ? "Dashboard" : "ផ្ទាំងគ្រប់គ្រង"}
      </h1>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Language switch */}
        <button
          onClick={toggleLanguage}
          className="px-3 py-1 rounded-lg border text-sm"
        >
          {language}
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2"
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            <Image
              src={
                user?.avatar?.url
                  ? `${baseURL}${user.avatar.url}`
                  : "/default-avatar.png"
              }
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2">
              <p className="px-4 py-2 text-sm text-gray-700">
                {user?.username || "Guest"}
              </p>
              <hr />
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                Profile
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                Settings
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
