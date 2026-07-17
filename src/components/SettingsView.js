"use client";

import { useEffect, useState } from "react";
import { updateProfile } from "@/lib/storage";

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-slate-500";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300";

export default function SettingsView({ userId, email, profile, onProfileChange, showToast }) {
  const [name, setName] = useState(profile?.name || "");
  const [gym, setGym] = useState(profile?.gym || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile?.name || "");
    setGym(profile?.gym || "");
    setPhone(profile?.phone || "");
  }, [profile]);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile(userId, { name: name.trim(), gym: gym.trim(), phone: phone.trim() });
      onProfileChange(updated);
      showToast?.("프로필이 저장되었습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">설정</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">프로필 정보를 관리하세요</p>
      </div>

      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
        <h3 className="mb-4 font-bold">트레이너 프로필</h3>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>이름</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>소속 헬스장 / 스튜디오</label>
            <input value={gym} onChange={(e) => setGym(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>연락처</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>이메일</label>
            <input value={email} disabled className={`${inputCls} bg-slate-50 text-slate-400 dark:bg-white/5`} />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-70 dark:bg-white dark:text-slate-900"
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>

      <p className="mt-4 max-w-xl text-xs text-slate-400">
        모든 회원 데이터는 이 계정으로 로그인한 어떤 기기에서도 동일하게 조회·수정할 수 있으며, 다른 트레이너 계정과는 안전하게 분리되어 저장됩니다.
      </p>
    </div>
  );
}
