"use client";

const SIZE = {
  md: "rounded-xl border border-slate-200 bg-white px-2 py-3 text-[15px] outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-white/10 dark:bg-white/5",
  sm: "rounded-lg border border-slate-200 bg-white px-1.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-white/10 dark:bg-white/5",
};

const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,10,...,55

function parse(value) {
  if (!value) return { period: "오전", hour12: 10, minute: 0 };
  const [h, m] = value.split(":").map(Number);
  const period = h < 12 ? "오전" : "오후";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { period, hour12, minute: m };
}

/**
 * 오전/오후 · 시 · 분을 각각 드롭다운으로 선택하는 시간 입력.
 * 네이티브 <input type="time">은 오전/오후 전환이 세그먼트+화살표 방식이라 헷갈리기 쉬워서 대체용으로 씀.
 * value/onChange는 <input type="time">과 동일하게 "HH:MM"(24시간) 문자열을 주고받는다.
 */
export default function TimeField({ value, onChange, size = "md", className = "" }) {
  const { period, hour12, minute } = parse(value);

  const emit = (nPeriod, nHour12, nMinute) => {
    let h = nHour12 % 12;
    if (nPeriod === "오후") h += 12;
    onChange(`${String(h).padStart(2, "0")}:${String(nMinute).padStart(2, "0")}`);
  };

  const cls = SIZE[size];

  return (
    <div className={`flex gap-1.5 ${className}`}>
      <select value={period} onChange={(e) => emit(e.target.value, hour12, minute)} className={`${cls} flex-[1.1]`}>
        <option value="오전">오전</option>
        <option value="오후">오후</option>
      </select>
      <select value={hour12} onChange={(e) => emit(period, Number(e.target.value), minute)} className={`${cls} flex-1`}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
          <option key={h} value={h}>{h}시</option>
        ))}
      </select>
      <select value={minute} onChange={(e) => emit(period, hour12, Number(e.target.value))} className={`${cls} flex-1`}>
        {MINUTES.map((m) => (
          <option key={m} value={m}>{String(m).padStart(2, "0")}분</option>
        ))}
      </select>
    </div>
  );
}
