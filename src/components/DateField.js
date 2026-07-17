"use client";

function daysInMonth(year, month) {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

const SIZE = {
  md: "rounded-xl border border-slate-200 bg-white px-2 py-3 text-[15px] outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-white/10 dark:bg-white/5",
  sm: "rounded-lg border border-slate-200 bg-white px-1.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-white/10 dark:bg-white/5",
};

/**
 * 년/월/일을 각각 드롭다운으로 선택하는 날짜 입력. 네이티브 <input type="date">는
 * 연도를 한 칸씩만 옮길 수 있어 생년월일처럼 먼 과거 날짜를 고르기 번거로워서 대체용으로 씀.
 * value/onChange는 <input type="date">와 동일하게 "YYYY-MM-DD" 문자열을 주고받는다.
 */
export default function DateField({ value, onChange, minYear, maxYear, size = "md", className = "" }) {
  const now = new Date();
  const [y, m, d] = value ? value.split("-").map(Number) : [null, null, null];

  const startYear = minYear ?? now.getFullYear() - 90;
  const endYear = maxYear ?? now.getFullYear() + 10;
  const years = [];
  for (let yr = endYear; yr >= startYear; yr--) years.push(yr);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: daysInMonth(y, m) }, (_, i) => i + 1);

  const emit = (ny, nm, nd) => {
    if (!ny || !nm || !nd) return;
    const clampedDay = Math.min(nd, daysInMonth(ny, nm));
    onChange(`${ny}-${String(nm).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`);
  };

  const cls = SIZE[size];

  return (
    <div className={`flex gap-1.5 ${className}`}>
      <select
        value={y ?? ""}
        onChange={(e) => emit(Number(e.target.value), m || now.getMonth() + 1, d || now.getDate())}
        className={`${cls} flex-[1.3]`}
      >
        <option value="" disabled>년</option>
        {years.map((yr) => (
          <option key={yr} value={yr}>{yr}년</option>
        ))}
      </select>
      <select
        value={m ?? ""}
        onChange={(e) => emit(y || now.getFullYear(), Number(e.target.value), d || now.getDate())}
        className={`${cls} flex-1`}
      >
        <option value="" disabled>월</option>
        {months.map((mo) => (
          <option key={mo} value={mo}>{mo}월</option>
        ))}
      </select>
      <select
        value={d ?? ""}
        onChange={(e) => emit(y || now.getFullYear(), m || now.getMonth() + 1, Number(e.target.value))}
        className={`${cls} flex-1`}
      >
        <option value="" disabled>일</option>
        {days.map((day) => (
          <option key={day} value={day}>{day}일</option>
        ))}
      </select>
    </div>
  );
}
