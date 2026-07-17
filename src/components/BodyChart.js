"use client";

const SERIES = [
  { key: "weight", label: "체중(kg)", color: "#f59e0b" },
  { key: "muscle", label: "골격근량(kg)", color: "#3b82f6" },
  { key: "fat", label: "체지방률(%)", color: "#f43f5e" },
];

const W = 640;
const H = 220;
const PAD = { l: 34, r: 12, t: 14, b: 24 };

export default function BodyChart({ records }) {
  const recs = (records || []).filter(
    (r) => r.weight != null || r.muscle != null || r.fat != null
  );

  const legend = (
    <div className="mb-3 flex flex-wrap gap-4">
      {SERIES.map((s) => (
        <span
          key={s.key}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300"
        >
          <i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
          {s.label}
        </span>
      ))}
    </div>
  );

  if (recs.length === 0) {
    return (
      <div>
        {legend}
        <div className="flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-white/10">
          신체 기록을 추가하면 변화 추이가 표시됩니다
        </div>
      </div>
    );
  }

  const allVals = [];
  SERIES.forEach((s) => recs.forEach((r) => { if (r[s.key] != null) allVals.push(r[s.key]); }));
  let min = Math.min(...allVals);
  let max = Math.max(...allVals);
  if (min === max) { min -= 1; max += 1; }
  const rangePad = (max - min) * 0.15;
  min -= rangePad;
  max += rangePad;

  const x = (i) =>
    PAD.l + (recs.length === 1 ? (W - PAD.l - PAD.r) / 2 : ((W - PAD.l - PAD.r) * i) / (recs.length - 1));
  const y = (v) => H - PAD.b - ((H - PAD.t - PAD.b) * (v - min)) / (max - min);

  const gridLines = [0, 1, 2, 3, 4].map((i) => PAD.t + ((H - PAD.t - PAD.b) * i) / 4);

  const skipEvery = recs.length > 8 ? Math.ceil(recs.length / 8) : 1;

  return (
    <div>
      {legend}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 240 }}>
        {gridLines.map((gy, i) => (
          <line key={i} x1={PAD.l} x2={W - PAD.r} y1={gy} y2={gy} stroke="currentColor" className="text-slate-100 dark:text-white/10" strokeWidth={1} />
        ))}
        {SERIES.map((s) => {
          const pts = recs
            .map((r, i) => (r[s.key] != null ? `${x(i)},${y(r[s.key])}` : null))
            .filter(Boolean)
            .join(" ");
          if (!pts) return null;
          return (
            <g key={s.key}>
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
              {recs.map((r, i) =>
                r[s.key] != null ? (
                  <circle key={i} cx={x(i)} cy={y(r[s.key])} r={3.2} fill={s.color} stroke="white" strokeWidth={1.2} />
                ) : null
              )}
            </g>
          );
        })}
        {recs.map((r, i) =>
          i % skipEvery === 0 ? (
            <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize={10} className="fill-slate-400">
              {r.date.slice(5)}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}
