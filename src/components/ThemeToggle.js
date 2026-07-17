"use client";

import { useEffect, useState } from "react";
import { getStoredTheme, saveTheme } from "@/lib/storage";
import { Icon } from "./icons";

export default function ThemeToggle({ className = "" }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    saveTheme(next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="테마 전환"
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-600 transition hover:bg-white hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 ${className}`}
    >
      {mounted && <Icon name={dark ? "sun" : "moon"} className="w-5 h-5" />}
    </button>
  );
}
