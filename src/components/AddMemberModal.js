"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import DateField from "./DateField";
import { todayISO } from "@/lib/format";
import { createMember, updateMember } from "@/lib/storage";

const MEMBERSHIP_TYPES = ["PT 10회", "PT 20회", "PT 30회", "헬스 3개월", "헬스 6개월", "헬스 12개월", "기타"];

function emptyForm() {
  const start = todayISO();
  const end = new Date();
  end.setMonth(end.getMonth() + 1);
  return {
    name: "",
    phone: "",
    gender: "여",
    birth: "",
    join_date: start,
    membership_type: MEMBERSHIP_TYPES[0],
    membership_start: start,
    membership_end: end.toISOString().slice(0, 10),
    pt_total: "10",
    goal: "",
    memo: "",
  };
}

function memberToForm(m) {
  return {
    name: m.name || "",
    phone: m.phone || "",
    gender: m.gender || "여",
    birth: m.birth || "",
    join_date: m.join_date || todayISO(),
    membership_type: m.membership_type || MEMBERSHIP_TYPES[0],
    membership_start: m.membership_start || "",
    membership_end: m.membership_end || "",
    pt_total: String(m.pt_total ?? 0),
    goal: m.goal || "",
    memo: m.memo || "",
  };
}

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-slate-500";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300";

export default function AddMemberModal({ open, onClose, userId, editingMember, onCreated, onUpdated }) {
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEdit = !!editingMember;

  useEffect(() => {
    if (!open) return;
    setForm(isEdit ? memberToForm(editingMember) : emptyForm());
    setError("");
  }, [open, editingMember]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("이름을 입력해 주세요.");
    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      birth: form.birth || null,
      join_date: form.join_date || null,
      membership_type: form.membership_type,
      membership_start: form.membership_start || null,
      membership_end: form.membership_end || null,
      pt_total: Number(form.pt_total) || 0,
      goal: form.goal.trim(),
      memo: form.memo.trim(),
    };
    try {
      if (isEdit) {
        const updated = await updateMember(editingMember.id, payload);
        onUpdated(updated);
      } else {
        const created = await createMember(userId, payload);
        onCreated(created);
      }
      onClose();
    } catch (err) {
      setError(err.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "회원 정보 수정" : "신규 회원 등록"}
      subtitle={isEdit ? undefined : "회원 정보와 회원권 정보를 입력하세요"}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>이름 *</label>
            <input value={form.name} onChange={set("name")} placeholder="홍길동" className={inputCls} autoFocus />
          </div>
          <div>
            <label className={labelCls}>연락처</label>
            <input value={form.phone} onChange={set("phone")} placeholder="010-1234-5678" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>성별</label>
            <select value={form.gender} onChange={set("gender")} className={inputCls}>
              <option value="여">여</option>
              <option value="남">남</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>회원권 종류</label>
            <select value={form.membership_type} onChange={set("membership_type")} className={inputCls}>
              {MEMBERSHIP_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>생년월일</label>
          <DateField value={form.birth} onChange={(v) => setForm((f) => ({ ...f, birth: v }))} />
        </div>

        <div>
          <label className={labelCls}>등록일</label>
          <DateField
            value={form.join_date}
            onChange={(v) => setForm((f) => ({ ...f, join_date: v }))}
            minYear={new Date().getFullYear() - 3}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>회원권 시작일</label>
            <DateField
              value={form.membership_start}
              onChange={(v) => setForm((f) => ({ ...f, membership_start: v }))}
              minYear={new Date().getFullYear() - 3}
              size="sm"
            />
          </div>
          <div>
            <label className={labelCls}>회원권 종료일</label>
            <DateField
              value={form.membership_end}
              onChange={(v) => setForm((f) => ({ ...f, membership_end: v }))}
              minYear={new Date().getFullYear() - 3}
              size="sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>총 PT 횟수</label>
            <input type="number" min="0" value={form.pt_total} onChange={set("pt_total")} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>운동 목표</label>
            <input value={form.goal} onChange={set("goal")} placeholder="예: 체지방 감량, 근비대" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>특이사항 / 부상이력 / 메모</label>
          <textarea
            value={form.memo}
            onChange={set("memo")}
            rows={3}
            placeholder="허리 디스크 이력, 무릎 통증 주의 등"
            className={`${inputCls} resize-none`}
          />
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 w-full rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-70"
        >
          {saving ? "저장 중..." : isEdit ? "저장하기" : "등록하기"}
        </button>
      </form>
    </Modal>
  );
}
