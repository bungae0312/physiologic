"use client";

import ThemeToggle from "./ThemeToggle";
import { Icon } from "./icons";

const FEATURES = [
  {
    icon: "users",
    title: "회원 관리",
    desc: "연락처, 회원권 종류와 기간, 운동 목표까지 한 곳에서. 만기 임박 회원은 자동으로 표시돼요.",
  },
  {
    icon: "chart",
    title: "신체 변화 기록",
    desc: "체중·골격근량·체지방률을 기록하면 추이 그래프로 바로 확인할 수 있어요.",
  },
  {
    icon: "fire",
    title: "PT 세션 관리",
    desc: "세션을 기록할 때마다 잔여 횟수가 자동으로 차감돼요. 재등록 타이밍을 놓치지 마세요.",
  },
  {
    icon: "calendar",
    title: "일정 관리",
    desc: "달력에서 회원별 PT 예약을 확인하고, 날짜를 눌러 바로 추가·수정할 수 있어요.",
  },
  {
    icon: "won",
    title: "매출 관리",
    desc: "결제 내역을 기록하면 이번 달 매출과 누적 매출이 자동으로 집계돼요.",
  },
  {
    icon: "settings",
    title: "안전한 계정 분리",
    desc: "트레이너별로 계정이 완전히 분리돼요. 내 회원 데이터는 나만 볼 수 있어요.",
  },
];

export default function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#0b0c10]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-600/15" />
        <div className="absolute top-40 -right-40 h-[36rem] w-[36rem] rounded-full bg-fuchsia-300/15 blur-3xl dark:bg-fuchsia-700/10" />
      </div>

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <Icon name="dumbbell" className="h-5 w-5" strokeWidth={2} />
          </div>
          <span className="text-[15px] font-bold">FitCRM</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onLogin}
            className="flex h-10 items-center rounded-full border border-slate-200 bg-white/70 px-4 text-sm font-medium text-slate-600 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            로그인
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pb-16 pt-10 text-center sm:px-8 sm:pb-24 sm:pt-16">
        <div className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
          <Icon name="dumbbell" className="h-3.5 w-3.5" strokeWidth={2.4} />
          트레이너를 위한 회원 관리
        </div>
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          엑셀과 메모장 대신,
          <br />
          <span className="bg-gradient-to-r from-brand-500 to-fuchsia-500 bg-clip-text text-transparent">
            회원 관리 하나로 끝내세요
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
          회원 정보, 신체 변화, PT 세션, 일정, 매출까지 — 트레이너에게 필요한 관리 도구를 하나의 공간에 모았습니다.
          회원가입하면 나만의 관리 화면이 바로 만들어져요.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={onGetStarted}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-105 active:scale-[0.99] sm:w-auto"
          >
            무료로 시작하기
            <Icon name="chevron-right" className="h-4 w-4" strokeWidth={2.4} />
          </button>
          <button
            onClick={onLogin}
            className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 sm:w-auto"
          >
            이미 계정이 있어요
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">무엇을 관리할 수 있나요</h2>
          <p className="mt-2 text-sm text-slate-400">회원 등록부터 매출 집계까지, 필요한 기능은 이미 다 들어있어요</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                <Icon name={f.icon} className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 font-bold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-3xl px-5 pb-24 text-center sm:px-8">
        <div className="rounded-3xl border border-white/60 bg-white/70 p-10 shadow-card dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">지금 바로 시작해보세요</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">가입은 1분이면 끝나요. 신용카드가 필요 없어요.</p>
          <button
            onClick={onGetStarted}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-105 active:scale-[0.99]"
          >
            무료로 시작하기
            <Icon name="chevron-right" className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 pb-10 text-center text-xs text-slate-400 sm:px-8">
        © {new Date().getFullYear()} FitCRM. 트레이너를 위한 회원 관리 서비스.
      </footer>
    </div>
  );
}
