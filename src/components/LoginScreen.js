"use client";

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { Icon } from "./icons";
import { signIn, signUp } from "@/lib/storage";

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-slate-500";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300";

export default function LoginScreen() {
  const [tab, setTab] = useState("login"); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");

  // signup fields
  const [name, setName] = useState("");
  const [gym, setGym] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const switchTab = (t) => {
    setTab(t);
    setError("");
    setNotice("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!loginEmail.trim() || !loginPw) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    setLoading(true);
    const { error: err } = await signIn({
      email: loginEmail.trim().toLowerCase(),
      password: loginPw,
    });
    setLoading(false);
    if (err) {
      setError(
        err.message?.includes("Invalid login credentials")
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : err.message
      );
    }
    // 성공 시 onAuthStateChange 리스너가 자동으로 대시보드로 전환합니다.
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!name.trim() || !email.trim() || !pw) {
      setError("이름, 이메일, 비밀번호는 필수입니다.");
      return;
    }
    if (pw.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (pw !== pw2) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    const { data, error: err } = await signUp({
      email: email.trim().toLowerCase(),
      password: pw,
      name: name.trim(),
      gym: gym.trim(),
    });
    setLoading(false);
    if (err) {
      setError(
        err.message?.includes("already registered")
          ? "이미 가입된 이메일입니다."
          : err.message
      );
      return;
    }
    if (!data.session) {
      // Supabase 프로젝트에서 이메일 확인이 켜져 있는 경우
      setNotice("가입 확인 이메일을 보냈어요. 메일함을 확인한 뒤 로그인해 주세요.");
      switchTab("login");
    }
    // data.session이 있으면 onAuthStateChange가 자동으로 대시보드로 전환합니다.
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-brand-400/30 blur-3xl dark:bg-brand-600/20" />
        <div className="absolute -bottom-52 -right-32 h-[40rem] w-[40rem] rounded-full bg-fuchsia-300/25 blur-3xl dark:bg-fuchsia-700/15" />
      </div>

      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-card">
              <Icon name="dumbbell" className="h-8 w-8" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">FitCRM</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              트레이너를 위한 프리미엄 회원 관리
            </p>
          </div>

          <div className="glass rounded-3xl border border-white/60 bg-white/70 p-7 shadow-card dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mb-6 flex gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-white/5">
              <button
                type="button"
                onClick={() => switchTab("login")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                  tab === "login"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white"
                    : "text-slate-400"
                }`}
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => switchTab("signup")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                  tab === "signup"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white"
                    : "text-slate-400"
                }`}
              >
                회원가입
              </button>
            </div>

            {notice && (
              <p className="mb-4 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                {notice}
              </p>
            )}

            {tab === "login" ? (
              <form onSubmit={handleLogin}>
                <label className={labelCls}>이메일</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@gym.com"
                  autoComplete="username"
                  className={`${inputCls} mb-4`}
                />
                <label className={labelCls}>비밀번호</label>
                <input
                  type="password"
                  value={loginPw}
                  onChange={(e) => setLoginPw(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={inputCls}
                />

                {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-70"
                >
                  {loading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    "로그인"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <label className={labelCls}>이름</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="김트레이너"
                  className={`${inputCls} mb-4`}
                />
                <label className={labelCls}>소속 헬스장 / 스튜디오</label>
                <input
                  value={gym}
                  onChange={(e) => setGym(e.target.value)}
                  placeholder="예: 강남 OO휘트니스"
                  className={`${inputCls} mb-4`}
                />
                <label className={labelCls}>이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gym.com"
                  autoComplete="username"
                  className={`${inputCls} mb-4`}
                />
                <div className="mb-1.5 grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>비밀번호</label>
                    <input
                      type="password"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      placeholder="6자 이상"
                      autoComplete="new-password"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>비밀번호 확인</label>
                    <input
                      type="password"
                      value={pw2}
                      onChange={(e) => setPw2(e.target.value)}
                      placeholder="6자 이상"
                      autoComplete="new-password"
                      className={inputCls}
                    />
                  </div>
                </div>

                {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-70"
                >
                  {loading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    "회원가입하고 시작하기"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
