"use client";

import { useMemo, useState } from "react";
import { Icon } from "./icons";
import { formatDateDot, daysLeft, membershipStatus, ptRemaining } from "@/lib/format";

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "active", label: "활성" },
  { key: "soon", label: "만기임박" },
  { key: "expired", label: "만료" },
];

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-sky-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
];
function gradientFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[h];
}

function StatusChip({ status }) {
  const cls =
    status === "active"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
      : status === "soon"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
      : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400";
  const label = status === "active" ? "활성" : status === "soon" ? "만기임박" : "만료";
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{label}</span>;
}

export default function MembersView({ members, sessionCounts, onOpenDetail, onAddClick }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .filter((m) => !q || m.name.toLowerCase().includes(q) || (m.phone || "").includes(q))
      .filter((m) => filter === "all" || membershipStatus(m) === filter);
  }, [members, query, filter]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">회원 관리</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">전체 {members.length}명의 회원을 관리하고 있습니다</p>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-105 active:scale-[0.99]"
        >
          <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />
          신규 회원 등록
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex w-full max-w-xs items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 dark:border-white/10 dark:bg-white/5">
          <Icon name="search" className="h-4 w-4 text-slate-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름 또는 연락처 검색"
            className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.key ? "bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white" : "text-slate-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 py-16 text-center dark:border-white/15">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5">
            <Icon name="users" className="h-7 w-7" />
          </div>
          <p className="font-semibold">
            {members.length === 0 ? "아직 등록된 회원이 없어요" : "검색 결과가 없어요"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {members.length === 0 ? "우측 상단의 '신규 회원 등록'으로 시작해 보세요." : "다른 이름이나 조건으로 찾아보세요."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => {
            const status = membershipStatus(m);
            const dl = daysLeft(m.membership_end);
            const remaining = ptRemaining(m, sessionCounts[m.id] || 0);
            const pct = m.pt_total > 0 ? Math.round((remaining / m.pt_total) * 100) : 0;
            return (
              <button
                key={m.id}
                onClick={() => onOpenDetail(m)}
                className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand-500/40"
              >
                <div className="mb-3.5 flex items-center gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradientFor(m.name)} text-[15px] font-bold text-white`}>
                    {m.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-bold leading-tight">{m.name}</h3>
                    <p className="mt-0.5 truncate text-xs text-slate-400">{m.phone || "연락처 미입력"}</p>
                  </div>
                  <StatusChip status={status} />
                </div>

                <div className="flex justify-between border-t border-dashed border-slate-100 py-1.5 text-xs text-slate-400 dark:border-white/10">
                  <span>회원권</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{m.membership_type || "-"}</span>
                </div>
                <div className="flex justify-between py-1.5 text-xs text-slate-400">
                  <span>만료일</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {formatDateDot(m.membership_end)} {dl !== null && `(D${dl >= 0 ? "-" : "+"}${Math.abs(dl)})`}
                  </span>
                </div>

                {m.pt_total > 0 && (
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
                      <span>PT 잔여</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{remaining} / {m.pt_total}회</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
