import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings } from "lucide-react";

export const UserMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem("supabase_uid");
    window.location.href = "/"; // redirect back to login
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <User className="w-5 h-5 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <button
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => alert("Profile clicked")}
          >
            <User className="w-4 h-4 mr-2" /> Profile
          </button>
          <button
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => alert("Settings clicked")}
          >
            <Settings className="w-4 h-4 mr-2" /> Settings
          </button>
          <button
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};
