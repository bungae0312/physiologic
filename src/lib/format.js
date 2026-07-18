export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// Days since start date (경과일)
export function daysSince(iso) {
  if (!iso) return 0;
  const start = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function progressPercent(total, remaining) {
  if (!total || total <= 0) return 0;
  const used = total - remaining;
  return Math.min(100, Math.max(0, Math.round((used / total) * 100)));
}

// "2026-07-18" -> "2026.07.18"
export function formatDateDot(iso) {
  if (!iso) return "-";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// 오늘 기준 남은 일수 (음수면 이미 지남)
export function daysLeft(iso) {
  if (!iso) return null;
  const end = new Date(iso + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((end - now) / 86400000);
}

export function fmtWon(n) {
  return `${Number(n || 0).toLocaleString("ko-KR")}원`;
}

export function ptRemaining(member, sessionCount) {
  return Math.max(0, (member.pt_total || 0) - (sessionCount || 0));
}

// "14:30" -> "오후 2:30"
export function formatTime12(hhmm) {
  if (!hhmm) return "-";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? "오전" : "오후";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return `${period} ${hour12}:${String(m).padStart(2, "0")}`;
}

export function membershipStatus(member) {
  const dl = daysLeft(member.membership_end);
  if (dl === null) return "active";
  if (dl < 0) return "expired";
  if (dl <= 7) return "soon";
  return "active";
}
