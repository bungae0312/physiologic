"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "./icons";
import ThemeToggle from "./ThemeToggle";
import DashboardHome from "./DashboardHome";
import MembersView from "./MembersView";
import ScheduleView from "./ScheduleView";
import RevenueView from "./RevenueView";
import SettingsView from "./SettingsView";
import AddMemberModal from "./AddMemberModal";
import MemberDetailModal from "./MemberDetailModal";
import {
  listMembers,
  listSchedules,
  listPayments,
  getSessionCountsByTrainer,
} from "@/lib/storage";

const NAV_ITEMS = [
  { key: "dashboard", label: "대시보드", icon: "home" },
  { key: "members", label: "회원 관리", icon: "users" },
  { key: "schedule", label: "일정 관리", icon: "calendar" },
  { key: "revenue", label: "매출 관리", icon: "won" },
  { key: "settings", label: "설정", icon: "settings" },
];

export default function Dashboard({ userId, email, profile, onProfileChange, onLogout }) {
  const [view, setView] = useState("dashboard");
  const [ready, setReady] = useState(false);
  const [members, setMembers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [payments, setPayments] = useState([]);
  const [sessionCounts, setSessionCounts] = useState({});
  const [toast, setToast] = useState("");

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [detailMember, setDetailMember] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    setReady(false);
    Promise.all([
      listMembers(userId),
      listSchedules(userId),
      listPayments(userId),
      getSessionCountsByTrainer(userId),
    ]).then(([m, s, p, c]) => {
      if (!mounted) return;
      setMembers(m);
      setSchedules(s);
      setPayments(p);
      setSessionCounts(c);
      setReady(true);
    });
    return () => { mounted = false; };
  }, [userId]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const openAddMember = () => {
    setEditingMember(null);
    setMemberModalOpen(true);
  };

  const openDetail = (m) => {
    setDetailMember(m);
    setDetailOpen(true);
  };

  const onMemberCreated = (m) => {
    setMembers((prev) => [m, ...prev]);
    showToast(`${m.name} 회원이 등록되었습니다.`);
  };

  const onMemberUpdated = (m) => {
    setMembers((prev) => prev.map((x) => (x.id === m.id ? m : x)));
    setDetailMember((prev) => (prev && prev.id === m.id ? m : prev));
    showToast("회원 정보가 저장되었습니다.");
  };

  const onMemberDeleted = (id) => {
    setMembers((prev) => prev.filter((x) => x.id !== id));
    setSchedules((prev) => prev.map((s) => (s.member_id === id ? { ...s, member_id: null } : s)));
    setPayments((prev) => prev.map((p) => (p.member_id === id ? { ...p, member_id: null } : p)));
    setSessionCounts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    showToast("회원이 삭제되었습니다.");
  };

  const onSessionCountDelta = (memberId, delta) => {
    setSessionCounts((prev) => ({ ...prev, [memberId]: Math.max(0, (prev[memberId] || 0) + delta) }));
  };

  const onScheduleSaved = (s) => {
    setSchedules((prev) => (prev.some((x) => x.id === s.id) ? prev.map((x) => (x.id === s.id ? s : x)) : [...prev, s]));
  };
  const onScheduleDeleted = (id) => setSchedules((prev) => prev.filter((x) => x.id !== id));
  const onPaymentSaved = (p) => setPayments((prev) => [p, ...prev]);
  const onPaymentDeleted = (id) => setPayments((prev) => prev.filter((x) => x.id !== id));

  const trainerName = profile?.name || "트레이너";

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 dark:border-white/10 dark:bg-[#0b0c10] lg:flex">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <Icon name="dumbbell" className="h-5 w-5" strokeWidth={2} />
          </div>
          <span className="text-[15px] font-bold">FitCRM</span>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                view === item.key
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
                  : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5"
              }`}
            >
              <Icon name={item.icon} className="h-4.5 w-4.5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-100 pt-4 dark:border-white/10">
          <div className="mb-2 flex items-center gap-2.5 px-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
              {trainerName.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{trainerName}</p>
              <p className="truncate text-xs text-slate-400">{profile?.gym || ""}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-50 hover:text-rose-500 dark:hover:bg-white/5"
          >
            <Icon name="logout" className="h-3.5 w-3.5" />
            로그아웃
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <header className="glass sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-[#0b0c10]/70 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <Icon name="dumbbell" className="h-4 w-4" strokeWidth={2} />
              </div>
              <span className="text-sm font-bold">FitCRM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <button
                onClick={onLogout}
                className="flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                <Icon name="logout" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto px-3 pb-2.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  view === item.key
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                }`}
              >
                <Icon name={item.icon} className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </header>

        {/* Desktop top-right controls */}
        <div className="hidden justify-end gap-2 px-6 pt-5 lg:flex">
          <ThemeToggle />
        </div>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {view === "dashboard" && (
            <DashboardHome
              trainerName={trainerName}
              members={members}
              schedules={schedules}
              payments={payments}
              onOpenDetail={openDetail}
              onGoToMembers={() => setView("members")}
            />
          )}
          {view === "members" && (
            <MembersView
              members={members}
              sessionCounts={sessionCounts}
              onOpenDetail={openDetail}
              onAddClick={openAddMember}
            />
          )}
          {view === "schedule" && (
            <ScheduleView
              userId={userId}
              members={members}
              schedules={schedules}
              onScheduleSaved={onScheduleSaved}
              onScheduleDeleted={onScheduleDeleted}
            />
          )}
          {view === "revenue" && (
            <RevenueView
              userId={userId}
              members={members}
              payments={payments}
              onPaymentSaved={onPaymentSaved}
              onPaymentDeleted={onPaymentDeleted}
            />
          )}
          {view === "settings" && (
            <SettingsView
              userId={userId}
              email={email}
              profile={profile}
              onProfileChange={onProfileChange}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      <AddMemberModal
        open={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        userId={userId}
        editingMember={editingMember}
        onCreated={onMemberCreated}
        onUpdated={onMemberUpdated}
      />

      <MemberDetailModal
        open={detailOpen}
        member={detailMember}
        userId={userId}
        onClose={() => setDetailOpen(false)}
        onMemberUpdated={onMemberUpdated}
        onMemberDeleted={onMemberDeleted}
        onSessionCountDelta={onSessionCountDelta}
        onEditRequest={(m) => {
          setDetailOpen(false);
          setEditingMember(m);
          setMemberModalOpen(true);
        }}
        showToast={showToast}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade-in">
          <div className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-card dark:bg-white dark:text-slate-900">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
