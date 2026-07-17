"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { todayISO } from "@/lib/format";
import { createSchedule, updateSchedule, deleteSchedule } from "@/lib/storage";

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-slate-500";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300";

export default function ScheduleModal({
  open,
  onClose,
  userId,
  members,
  editingSchedule,
  presetDate,
  onSaved,
  onDeleted,
}) {
  const isEdit = !!editingSchedule;
  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("10:00");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setMemberId(editingSchedule.member_id || "");
      setDate(editingSchedule.date);
      setTime(editingSchedule.time || "10:00");
      setMemo(editingSchedule.memo || "");
    } else {
      setMemberId(members[0]?.id || "");
      setDate(presetDate || todayISO());
      setTime("10:00");
      setMemo("");
    }
    setError("");
  }, [open, editingSchedule, presetDate]);

  if (members.length === 0 && !isEdit) {
    return open ? (
      <Modal open={open} onClose={onClose} title="일정 추가">
        <p className="py-6 text-center text-sm text-slate-400">먼저 회원을 등록해주세요.</p>
      </Modal>
    ) : null;
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!memberId || !date) {
      setError("회원과 날짜를 선택해주세요.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        const updated = await updateSchedule(editingSchedule.id, { member_id: memberId, date, time, memo: memo.trim() });
        onSaved(updated);
      } else {
        const created = await createSchedule(userId, { member_id: memberId, date, time, memo: memo.trim() });
        onSaved(created);
      }
      onClose();
    } catch (err) {
      setError(err.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("이 일정을 삭제하시겠습니까?")) return;
    await deleteSchedule(editingSchedule.id);
    onDeleted(editingSchedule.id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "일정 수정" : "일정 추가"}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelCls}>회원</label>
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputCls}>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>시간</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>메모</label>
          <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: 첫 상담 / 인바디 측정" className={inputCls} />
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="flex items-center gap-2 pt-1">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="mr-auto rounded-2xl px-4 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              삭제
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 py-3 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-70"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
