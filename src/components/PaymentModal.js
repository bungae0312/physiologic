"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { todayISO } from "@/lib/format";
import { createPayment } from "@/lib/storage";

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-slate-500";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300";

export default function PaymentModal({ open, onClose, userId, members, onSaved }) {
  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState("");
  const [item, setItem] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMemberId(members[0]?.id || "");
    setDate(todayISO());
    setAmount("");
    setItem("");
    setError("");
  }, [open]);

  if (members.length === 0) {
    return open ? (
      <Modal open={open} onClose={onClose} title="결제 등록">
        <p className="py-6 text-center text-sm text-slate-400">먼저 회원을 등록해주세요.</p>
      </Modal>
    ) : null;
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!memberId || !date || !amount) {
      setError("회원, 날짜, 금액을 모두 입력해주세요.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const created = await createPayment(userId, { member_id: memberId, date, amount: Number(amount), item: item.trim() });
      onSaved(created);
      onClose();
    } catch (err) {
      setError(err.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="결제 등록">
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
            <label className={labelCls}>금액(원)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>항목</label>
          <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="예: PT 20회 등록" className={inputCls} />
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-70"
        >
          {saving ? "저장 중..." : "등록"}
        </button>
      </form>
    </Modal>
  );
}
