"use client";

import { useMemo, useState } from "react";
import { Icon } from "./icons";
import PaymentModal from "./PaymentModal";
import { fmtWon, formatDateDot } from "@/lib/format";
import { deletePayment } from "@/lib/storage";

function memberName(members, id) {
  return members.find((m) => m.id === id)?.name || "삭제된 회원";
}

export default function RevenueView({ userId, members, payments, onPaymentSaved, onPaymentDeleted }) {
  const [modalOpen, setModalOpen] = useState(false);

  const now = new Date();
  const { monthTotal, monthCount, allTotal } = useMemo(() => {
    let monthTotal = 0, monthCount = 0, allTotal = 0;
    for (const p of payments) {
      allTotal += Number(p.amount || 0);
      const d = new Date(p.date + "T00:00:00");
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        monthTotal += Number(p.amount || 0);
        monthCount += 1;
      }
    }
    return { monthTotal, monthCount, allTotal };
  }, [payments]);

  const sorted = useMemo(() => [...payments].sort((a, b) => b.date.localeCompare(a.date)), [payments]);

  const handleDelete = async (id) => {
    if (!confirm("이 결제 내역을 삭제하시겠습니까?")) return;
    await deletePayment(id);
    onPaymentDeleted(id);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">매출 관리</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">결제 내역을 기록하고 월별 매출을 확인하세요</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-105 active:scale-[0.99]"
        >
          <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />
          결제 등록
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon="won" label="이번달 매출" value={fmtWon(monthTotal)} accent="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" />
        <StatCard icon="chart" label="누적 총 매출" value={fmtWon(allTotal)} accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" />
        <StatCard icon="calendar" label="이번달 결제 건수" value={`${monthCount}건`} accent="bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400" />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
        <div className="border-b border-slate-100 px-6 py-5 dark:border-white/10">
          <h3 className="font-bold">결제 내역</h3>
        </div>
        <div className="p-4 sm:p-6">
          {sorted.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">등록된 결제 내역이 없습니다</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400">
                    <th className="pb-3 font-semibold">날짜</th>
                    <th className="pb-3 font-semibold">회원</th>
                    <th className="pb-3 font-semibold">항목</th>
                    <th className="pb-3 font-semibold">금액</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100 dark:border-white/5">
                      <td className="py-3">{formatDateDot(p.date)}</td>
                      <td className="py-3">{memberName(members, p.member_id)}</td>
                      <td className="py-3">{p.item || "-"}</td>
                      <td className="py-3 font-semibold">{fmtWon(p.amount)}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => handleDelete(p.id)} className="text-xs text-slate-300 hover:text-rose-500">삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
        members={members}
        onSaved={onPaymentSaved}
      />
    </div>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
          <Icon name={icon} className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="text-xl font-extrabold tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}
