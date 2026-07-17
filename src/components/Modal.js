"use client";

import { useEffect } from "react";
import { Icon } from "./icons";

export default function Modal({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg animate-pop-in overflow-y-auto rounded-t-3xl border border-white/60 bg-white p-6 shadow-card dark:border-white/10 dark:bg-[#15161c] sm:rounded-3xl">
        <div className={`flex items-start justify-between ${title ? "mb-5" : "mb-1"}`}>
          {title ? (
            <div>
              <h2 className="text-lg font-bold tracking-tight">{title}</h2>
              {subtitle && (
                <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
              )}
            </div>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
