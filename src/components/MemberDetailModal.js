"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import BodyChart from "./BodyChart";
import DateField from "./DateField";
import { Icon } from "./icons";
import {
  listBodyRecords,
  addBodyRecord,
  deleteBodyRecord,
  listSessions,
  addSession,
  deleteSession,
  updateMember,
  deleteMember,
} from "@/lib/storage";
import { formatDateDot, todayISO, ptRemaining, membershipStatus } from "@/lib/format";

const TABS = [
  { key: "info", label: "기본정보" },
  { key: "body", label: "신체기록" },
  { key: "session", label: "PT 세션" },
  { key: "memo", label: "메모" },
];

const statusChip = {
  active: <span className="chip-green">활성</span>,
  soon: <span className="chip-amber">만기임박</span>,
  expired: <span className="chip-red">만료</span>,
};

function Chip({ status }) {
  const cls =
    status === "active"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
      : status === "soon"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
      : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400";
  const label = status === "active" ? "활성" : status === "soon" ? "만기임박" : "만료";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{label}</span>;
}

const inputCls =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-white/10 dark:bg-white/5";
const labelCls = "mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400";

export default function MemberDetailModal({
  open,
  member,
  userId,
  onClose,
  onMemberUpdated,
  onMemberDeleted,
  onEditRequest,
  onSessionCountDelta,
  showToast,
}) {
  const [tab, setTab] = useState("info");
  const [bodyRecords, setBodyRecords] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [brDate, setBrDate] = useState(todayISO());
  const [brWeight, setBrWeight] = useState("");
  const [brMuscle, setBrMuscle] = useState("");
  const [brFat, setBrFat] = useState("");

  const [sessDate, setSessDate] = useState(todayISO());
  const [sessNote, setSessNote] = useState("");

  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (!open || !member) return;
    setTab("info");
    setMemo(member.memo || "");
    setBrDate(todayISO());
    setSessDate(todayISO());
    setBrWeight("");
    setBrMuscle("");
    setBrFat("");
    setSessNote("");
    setLoading(true);
    Promise.all([listBodyRecords(member.id), listSessions(member.id)])
      .then(([br, ss]) => {
        setBodyRecords(br);
        setSessions(ss);
      })
      .finally(() => setLoading(false));
  }, [open, member?.id]);

  if (!member) return null;

  const remaining = ptRemaining(member, sessions.length);
  const pct = member.pt_total > 0 ? Math.round((remaining / member.pt_total) * 100) : 0;
  const status = membershipStatus(member);

  const submitBodyRecord = async (e) => {
    e.preventDefault();
    const weight = brWeight === "" ? null : parseFloat(brWeight);
    const muscle = brMuscle === "" ? null : parseFloat(brMuscle);
    const fat = brFat === "" ? null : parseFloat(brFat);
    if (weight == null && muscle == null && fat == null) {
      showToast?.("측정값을 하나 이상 입력해주세요.");
      return;
    }
    const rec = await addBodyRecord(userId, member.id, { date: brDate, weight, muscle, fat });
    setBodyRecords((prev) => [...prev, rec].sort((a, b) => a.date.localeCompare(b.date)));
    setBrWeight("");
    setBrMuscle("");
    setBrFat("");
    showToast?.("신체 기록이 추가되었습니다.");
  };

  const removeBodyRecord = async (id) => {
    await deleteBodyRecord(id);
    setBodyRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const submitSession = async (e) => {
    e.preventDefault();
    if (member.pt_total > 0 && remaining <= 0) {
      if (!confirm("PT 잔여 횟수가 0회입니다. 그래도 세션을 기록하시겠습니까?")) return;
    }
    const s = await addSession(userId, member.id, { date: sessDate, note: sessNote.trim() });
    setSessions((prev) => [...prev, s].sort((a, b) => a.date.localeCompare(b.date)));
    setSessNote("");
    onSessionCountDelta?.(member.id, 1);
    showToast?.("PT 세션이 기록되었습니다.");
  };

  const removeSession = async (id) => {
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    onSessionCountDelta?.(member.id, -1);
  };

  const saveMemo = async () => {
    const updated = await updateMember(member.id, { memo });
    onMemberUpdated(updated);
    showToast?.("메모가 저장되었습니다.");
  };

  const handleDelete = async () => {
    if (!confirm(`${member.name} 회원을 삭제하시겠습니까? 관련 일정·결제 기록도 함께 정리됩니다.`)) return;
    await deleteMember(member.id);
    onMemberDeleted(member.id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white">
          {member.name.slice(0, 1)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">{member.name}</h2>
          <div className="mt-1 flex items-center gap-2">
            <Chip status={status} />
            <span className="text-xs text-slate-400">{member.phone || "연락처 미입력"}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-5 border-b border-slate-100 dark:border-white/10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative -mb-px border-b-2 pb-2.5 text-sm font-semibold transition ${
              tab === t.key
                ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div>
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="연락처" value={member.phone || "-"} />
            <InfoItem label="성별 / 생년월일" value={`${member.gender || "-"} / ${member.birth ? formatDateDot(member.birth) : "-"}`} />
            <InfoItem label="등록일" value={formatDateDot(member.join_date)} />
            <InfoItem label="회원권 종류" value={member.membership_type || "-"} />
            <InfoItem label="회원권 기간" value={`${formatDateDot(member.membership_start)} ~ ${formatDateDot(member.membership_end)}`} />
            <InfoItem label="운동 목표" value={member.goal || "-"} />
          </div>

          {member.pt_total > 0 && (
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">PT 잔여횟수</span>
                <b>{remaining} / {member.pt_total}회</b>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => onEditRequest(member)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <Icon name="edit" className="h-4 w-4" />
              정보 수정
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <Icon name="trash" className="h-4 w-4" />
              회원 삭제
            </button>
          </div>
        </div>
      )}

      {tab === "body" && (
        <div>
          <BodyChart records={bodyRecords} />
          <form onSubmit={submitBodyRecord} className="mt-4 flex flex-wrap items-end gap-2 rounded-2xl bg-slate-50 p-3.5 dark:bg-white/5">
            <div>
              <label className={labelCls}>측정일</label>
              <DateField value={brDate} onChange={setBrDate} minYear={new Date().getFullYear() - 3} size="sm" />
            </div>
            <div>
              <label className={labelCls}>체중(kg)</label>
              <input type="number" step="0.1" value={brWeight} onChange={(e) => setBrWeight(e.target.value)} className={`${inputCls} w-24`} />
            </div>
            <div>
              <label className={labelCls}>골격근량(kg)</label>
              <input type="number" step="0.1" value={brMuscle} onChange={(e) => setBrMuscle(e.target.value)} className={`${inputCls} w-24`} />
            </div>
            <div>
              <label className={labelCls}>체지방률(%)</label>
              <input type="number" step="0.1" value={brFat} onChange={(e) => setBrFat(e.target.value)} className={`${inputCls} w-24`} />
            </div>
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
              추가
            </button>
          </form>

          <div className="mt-4 max-h-52 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400">
                  <th className="pb-2 font-semibold">날짜</th>
                  <th className="pb-2 font-semibold">체중</th>
                  <th className="pb-2 font-semibold">골격근량</th>
                  <th className="pb-2 font-semibold">체지방률</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {[...bodyRecords].reverse().map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 dark:border-white/5">
                    <td className="py-2">{formatDateDot(r.date)}</td>
                    <td className="py-2">{r.weight ?? "-"}</td>
                    <td className="py-2">{r.muscle ?? "-"}</td>
                    <td className="py-2">{r.fat ?? "-"}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => removeBodyRecord(r.id)} className="text-xs text-slate-300 hover:text-rose-500">삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bodyRecords.length === 0 && !loading && (
              <p className="py-6 text-center text-sm text-slate-400">기록이 없습니다</p>
            )}
          </div>
        </div>
      )}

      {tab === "session" && (
        <div>
          <form onSubmit={submitSession} className="flex flex-wrap items-end gap-2 rounded-2xl bg-slate-50 p-3.5 dark:bg-white/5">
            <div>
              <label className={labelCls}>세션 날짜</label>
              <DateField value={sessDate} onChange={setSessDate} minYear={new Date().getFullYear() - 3} size="sm" />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className={labelCls}>운동 내용 메모</label>
              <input
                value={sessNote}
                onChange={(e) => setSessNote(e.target.value)}
                placeholder="예: 하체 위주, 스쿼트 60kg x5"
                className={`${inputCls} w-full`}
              />
            </div>
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
              출석 체크 (+1회 차감)
            </button>
          </form>

          <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
            {[...sessions].reverse().map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3.5 py-2.5 dark:border-white/5">
                <div>
                  <p className="text-sm font-semibold">{formatDateDot(s.date)}</p>
                  <p className="text-xs text-slate-400">{s.note || "메모 없음"}</p>
                </div>
                <button onClick={() => removeSession(s.id)} className="text-xs text-slate-300 hover:text-rose-500">삭제</button>
              </div>
            ))}
            {sessions.length === 0 && !loading && (
              <p className="py-6 text-center text-sm text-slate-400">기록된 PT 세션이 없습니다</p>
            )}
          </div>
        </div>
      )}

      {tab === "memo" && (
        <div>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={8}
            placeholder="특이사항, 부상이력, 운동 시 주의사항 등을 자유롭게 기록하세요."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-white/10 dark:bg-white/5"
          />
          <button
            onClick={saveMemo}
            className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
          >
            메모 저장
          </button>
        </div>
      )}
    </Modal>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 dark:bg-white/5">
      <p className="mb-0.5 text-[11px] font-semibold text-slate-400">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
