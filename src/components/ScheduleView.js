"use client";

import { useMemo, useState } from "react";
import Modal from "./Modal";
import ScheduleModal from "./ScheduleModal";
import { Icon } from "./icons";
import { todayISO, formatDateDot } from "@/lib/format";
import { deleteSchedule } from "@/lib/storage";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

function memberName(members, id) {
  return members.find((m) => m.id === id)?.name || "삭제된 회원";
}

export default function ScheduleView({ userId, members, schedules, onScheduleSaved, onScheduleDeleted }) {
  const [cursor, setCursor] = useState(() => new Date());
  const [activeDate, setActiveDate] = useState(null);
  const [dayListOpen, setDayListOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [returnToDayList, setReturnToDayList] = useState(false);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const todayStr = todayISO();

  const byDate = useMemo(() => {
    const map = {};
    for (const s of schedules) {
      (map[s.date] ||= []).push(s);
    }
    Object.values(map).forEach((list) => list.sort((a, b) => (a.time || "").localeCompare(b.time || "")));
    return map;
  }, [schedules]);

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list = [];
    for (let i = 0; i < startOffset; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      list.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    return list;
  }, [year, month]);

  const shift = (n) => setCursor(new Date(year, month + n, 1));
  const goToday = () => setCursor(new Date());

  const openDayList = (iso) => {
    setActiveDate(iso);
    setDayListOpen(true);
  };

  const openAddFromDayList = () => {
    setEditingSchedule(null);
    setReturnToDayList(true);
    setDayListOpen(false);
    setScheduleModalOpen(true);
  };

  const openEditFromDayList = (s) => {
    setEditingSchedule(s);
    setReturnToDayList(true);
    setDayListOpen(false);
    setScheduleModalOpen(true);
  };

  const openEditFromChip = (s) => {
    setEditingSchedule(s);
    setReturnToDayList(false);
    setScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setScheduleModalOpen(false);
    if (returnToDayList) setDayListOpen(true);
    setReturnToDayList(false);
  };

  const dayEvents = activeDate ? byDate[activeDate] || [] : [];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">일정 관리</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">회원별 PT 예약을 달력으로 관리하세요</p>
        </div>
        <button
          onClick={() => {
            setEditingSchedule(null);
            setReturnToDayList(false);
            setScheduleModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-105 active:scale-[0.99]"
        >
          <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />
          일정 추가
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold">{year}년 {month + 1}월</h3>
          <div className="flex gap-1.5">
            <button onClick={() => shift(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10">
              <Icon name="chevron-left" className="h-4 w-4" />
            </button>
            <button onClick={goToday} className="rounded-lg bg-slate-100 px-3 text-sm font-medium hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10">오늘</button>
            <button onClick={() => shift(1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10">
              <Icon name="chevron-right" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {DOW.map((d) => (
            <div key={d} className="pb-1.5 text-center text-xs font-bold text-slate-300">{d}</div>
          ))}
          {cells.map((iso, i) => {
            if (!iso) return <div key={i} />;
            const dayNum = Number(iso.slice(-2));
            const isToday = iso === todayStr;
            const events = byDate[iso] || [];
            return (
              <div
                key={iso}
                onClick={() => openDayList(iso)}
                className={`min-h-[76px] cursor-pointer rounded-xl border p-1.5 transition sm:min-h-[92px] sm:p-2 ${
                  isToday
                    ? "border-transparent bg-slate-900 dark:bg-white/10"
                    : "border-transparent bg-slate-50 hover:border-brand-300 dark:bg-white/[0.02] dark:hover:border-brand-500/40"
                }`}
              >
                <div className={`mb-1 text-xs font-bold ${isToday ? "text-brand-300" : ""}`}>{dayNum}</div>
                <div className="space-y-1">
                  {events.slice(0, 2).map((s) => (
                    <div
                      key={s.id}
                      onClick={(e) => { e.stopPropagation(); openEditFromChip(s); }}
                      className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        isToday ? "bg-white/15 text-white" : "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                      }`}
                    >
                      {s.time} {memberName(members, s.member_id)}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className={`text-[10px] font-semibold ${isToday ? "text-white/50" : "text-slate-300"}`}>+{events.length - 2}건 더보기</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 날짜별 일정 목록 */}
      <Modal open={dayListOpen} onClose={() => setDayListOpen(false)} title={activeDate ? `${formatDateDot(activeDate)} 일정` : "일정"}>
        {dayEvents.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">이 날짜에 등록된 일정이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {dayEvents.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3.5 py-3 dark:border-white/5">
                <div>
                  <p className="text-sm font-semibold">{s.time || "-"} · {memberName(members, s.member_id)}</p>
                  <p className="text-xs text-slate-400">{s.memo || "메모 없음"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => openEditFromDayList(s)} className="text-xs font-semibold text-slate-500 hover:text-brand-600">✎ 수정</button>
                  <button
                    onClick={async () => {
                      if (!confirm("이 일정을 삭제하시겠습니까?")) return;
                      await deleteSchedule(s.id);
                      onScheduleDeleted(s.id);
                    }}
                    className="text-xs text-slate-300 hover:text-rose-500"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={openAddFromDayList}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />
          새 일정 추가
        </button>
      </Modal>

      <ScheduleModal
        open={scheduleModalOpen}
        onClose={closeScheduleModal}
        userId={userId}
        members={members}
        editingSchedule={editingSchedule}
        presetDate={activeDate}
        onSaved={onScheduleSaved}
        onDeleted={onScheduleDeleted}
      />
    </div>
  );
}
