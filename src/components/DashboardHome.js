"use client";

import { useMemo } from "react";
import { Icon } from "./icons";
import { formatDateDot, daysLeft, fmtWon, membershipStatus, formatTime12 } from "@/lib/format";

function memberName(members, id) {
  return members.find((m) => m.id === id)?.name || "삭제된 회원";
}

export default function DashboardHome({ trainerName, members, schedules, payments, onOpenDetail, onGoToMembers }) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const totalMembers = members.length;
    const newThisMonth = members.filter((m) => {
      if (!m.join_date) return false;
      const d = new Date(m.join_date + "T00:00:00");
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const expiring = members.filter((m) => {
      const dl = daysLeft(m.membership_end);
      return dl !== null && dl >= 0 && dl <= 7;
    });
    const todaySchedules = schedules.filter((s) => s.date === todayStr);
    const monthRevenue = payments
      .filter((p) => {
        const d = new Date(p.date + "T00:00:00");
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((a, p) => a + Number(p.amount || 0), 0);
    return { totalMembers, newThisMonth, expiring, todaySchedules, monthRevenue };
  }, [members, schedules, payments]);

  const recentMembers = useMemo(
    () => [...members].sort((a, b) => (b.join_date || "").localeCompare(a.join_date || "")).slice(0, 5),
    [members]
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{trainerName} 트레이너님, 안녕하세요</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {now.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat icon="users" label="전체 회원" value={`${stats.totalMembers}명`} accent="bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400" />
        <Stat icon="plus" label="이번달 신규" value={`${stats.newThisMonth}명`} accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" />
        <Stat icon="alert" label="만기임박(7일)" value={`${stats.expiring.length}명`} accent="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" />
        <Stat icon="clock" label="오늘 PT 일정" value={`${stats.todaySchedules.length}건`} accent="bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400" />
        <Stat icon="won" label="이번달 매출" value={fmtWon(stats.monthRevenue)} accent="bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="회원권 만기 임박" subtitle="7일 이내 종료되는 회원권입니다">
          {stats.expiring.length === 0 ? (
            <Empty icon="check" text="만기 임박 회원이 없습니다" />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {[...stats.expiring]
                .sort((a, b) => daysLeft(a.membership_end) - daysLeft(b.membership_end))
                .map((m) => {
                  const dl = daysLeft(m.membership_end);
                  return (
                    <button key={m.id} onClick={() => onOpenDetail(m)} className="flex w-full items-center gap-3 py-3 text-left">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                        {m.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{m.name}</p>
                        <p className="truncate text-xs text-slate-400">{m.membership_type} · {formatDateDot(m.membership_end)} 종료</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${dl <= 2 ? "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"}`}>
                        D-{dl}
                      </span>
                    </button>
                  );
                })}
            </div>
          )}
        </Panel>

        <Panel title="오늘의 PT 일정" subtitle={now.toLocaleDateString("ko-KR", { month: "long", day: "numeric" }) + " 예정된 세션"}>
          {stats.todaySchedules.length === 0 ? (
            <Empty icon="clock" text="오늘 예정된 일정이 없습니다" />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {[...stats.todaySchedules]
                .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
                .map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                      {memberName(members, s.member_id).slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{memberName(members, s.member_id)}</p>
                      <p className="truncate text-xs text-slate-400">{s.memo || "PT 세션"}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                      {formatTime12(s.time)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-bold">최근 등록 회원</h3>
          <button onClick={onGoToMembers} className="text-xs font-semibold text-brand-600 dark:text-brand-400">전체보기</button>
        </div>
        {recentMembers.length === 0 ? (
          <Empty icon="users" text="등록된 회원이 없습니다. 첫 회원을 등록해보세요!" />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {recentMembers.map((m) => (
              <button key={m.id} onClick={() => onOpenDetail(m)} className="flex w-full items-center gap-3 py-3 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                  {m.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.name}</p>
                  <p className="truncate text-xs text-slate-400">{m.membership_type} · 등록일 {formatDateDot(m.join_date)}</p>
                </div>
                <StatusChip status={membershipStatus(m)} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
        <Icon name={icon} className="h-4.5 w-4.5" />
      </div>
      <p className="text-lg font-extrabold tracking-tight sm:text-xl">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-400">{label}</p>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
      <h3 className="font-bold">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Empty({ icon, text }) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-300 dark:bg-white/5">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
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
