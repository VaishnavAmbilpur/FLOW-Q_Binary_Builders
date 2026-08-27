"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const dropdownRef = useRef(null);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  const currentIcon =
    resolvedTheme === "dark" ? (
      <Moon className="w-5 h-5 text-slate-200" />
    ) : (
      <Sun className="w-5 h-5 text-yellow-500" />
    );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 backdrop-blur-md shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-500/50 group"
        aria-label="Toggle Dark Mode"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500 group-hover:text-amber-600 transition-colors" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden z-50 animate-fadeInDown origin-top-right">
          <div className="p-1.5 flex flex-col gap-1">
            <button
              onClick={() => {
                setTheme("dark");
                setIsOpen(false);
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${theme === "dark" ? "bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400" : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
            >
              <Moon className="w-4 h-4" /> Dark
            </button>
            <button
              onClick={() => {
                setTheme("system");
                setIsOpen(false);
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${theme === "system" ? "bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400" : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
            >
              <Monitor className="w-4 h-4" /> System
            </button>
            <button
              onClick={() => {
                setTheme("light");
                setIsOpen(false);
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${theme === "light" ? "bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400" : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
